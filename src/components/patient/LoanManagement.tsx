import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Calendar, Bell, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { loanService, LoanApplication, EmiPayment } from "@/services/loanService";
import { processPaymentWithFallback, PaymentMethod } from "@/services/mockPaymentService";
import { useAuth } from "@/hooks/useAuth";

const LoanManagement = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  
  // State management
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [emiSchedule, setEmiSchedule] = useState<EmiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [payEmiDialogOpen, setPayEmiDialogOpen] = useState(false);
  const [prepayDialogOpen, setPrepayDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [prepayAmount, setPrepayAmount] = useState("");
  const [isFullPrepay, setIsFullPrepay] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const loansData = await loanService.getAllLoans();
      // For patient, filter by patientId only (for extra safety, backend also enforces)
      const patientId = authState.user?.patientId || authState.user?._id;
      const approvedLoans = loansData.filter(
        (loan) => loan.patientId === patientId && (loan.status === 'approved' || loan.status === 'disbursed')
      );
      setLoans(approvedLoans);
      if (approvedLoans.length > 0) {
        setSelectedLoan(approvedLoans[0]);
        fetchEmiSchedule(approvedLoans[0]._id!);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch loan data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmiSchedule = async (loanId: string) => {
    try {
      const schedule = await loanService.getEmiSchedule(loanId);
      setEmiSchedule(schedule);
    } catch (error) {
      console.error('Error fetching EMI schedule:', error);
    }
  };

  const handleLoanSelect = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    if (loan._id) {
      fetchEmiSchedule(loan._id);
    }
  };

  const handlePayEMI = async () => {
    if (!selectedLoan) return;

    const nextEmi = emiSchedule.find(emi => emi.status === 'pending');
    if (!nextEmi) {
      toast({
        variant: "destructive",
        title: "No Pending EMI",
        description: "No pending EMI found for this loan.",
      });
      return;
    }

    setProcessingPayment(true);
    
    try {
      const paymentResult = await processPaymentWithFallback({
        amount: nextEmi.emiAmount,
        description: `EMI Payment for Loan ${selectedLoan.applicationNumber}`,
        paymentMethod,
        metadata: {
          loanId: selectedLoan._id,
          emiNumber: nextEmi.emiNumber,
          dueDate: nextEmi.dueDate
        }
      });
      
      if (paymentResult && paymentResult.success) {
        // Update EMI payment in backend
        await loanService.payEmi(nextEmi._id, {
          paymentMethod,
          transactionId: paymentResult.transactionId
        });

        setPayEmiDialogOpen(false);
        toast({
          title: "EMI Payment Successful",
          description: `Transaction ID: ${paymentResult.transactionId}`,
        });
        
        // Refresh data
        await fetchLoans();
        if (selectedLoan._id) {
          await fetchEmiSchedule(selectedLoan._id);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Unable to process your EMI payment.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrepayLoan = async () => {
    if (!selectedLoan) return;

    if (!prepayAmount && !isFullPrepay) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid prepayment amount.",
      });
      return;
    }
    
    const amount = isFullPrepay ? (selectedLoan.emiDetails?.remainingBalance || 0) : Number(prepayAmount);
    
    if (!isFullPrepay && (amount <= 0 || amount > (selectedLoan.emiDetails?.remainingBalance || 0))) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: `Amount must be between 1 and ${selectedLoan.emiDetails?.remainingBalance}`,
      });
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const paymentResult = await processPaymentWithFallback({
        amount,
        description: isFullPrepay 
          ? `Full Prepayment for Loan ${selectedLoan.applicationNumber}` 
          : `Partial Prepayment for Loan ${selectedLoan.applicationNumber}`,
        paymentMethod,
        metadata: {
          loanId: selectedLoan._id,
          prepaymentType: isFullPrepay ? 'full' : 'partial'
        }
      });
      
      if (paymentResult && paymentResult.success) {
        // Update prepayment in backend
        await loanService.prepayLoan(selectedLoan._id!, {
          amount,
          paymentMethod,
          transactionId: paymentResult.transactionId
        });

        setPrepayDialogOpen(false);
        setPrepayAmount("");
        setIsFullPrepay(false);
        
        toast({
          title: "Prepayment Successful",
          description: `Transaction ID: ${paymentResult.transactionId}`,
        });
        
        // Refresh data
        await fetchLoans();
        if (selectedLoan._id) {
          await fetchEmiSchedule(selectedLoan._id);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Unable to process your prepayment.",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadStatement = () => {
    toast({
      title: "Loan Statement",
      description: "Your loan statement is being downloaded.",
    });
  };

  const handleSetReminder = () => {
    toast({
      title: "Payment Reminder",
      description: "We'll remind you 3 days before your EMI due date.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading loan data...</span>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Loans</h3>
            <p className="text-muted-foreground mb-4">You don't have any active loans to manage.</p>
            <Button>Apply for a New Loan</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loan Selection */}
      {loans.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Loan</CardTitle>
            <CardDescription>Choose a loan to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loans.map((loan) => (
                <Card 
                  key={loan._id} 
                  className={`cursor-pointer transition-colors ${
                    selectedLoan?._id === loan._id ? 'border-primary' : ''
                  }`}
                  onClick={() => handleLoanSelect(loan)}
                >
                  <CardContent className="pt-4">
                    <div className="text-sm font-medium">{loan.applicationNumber}</div>
                    <div className="text-lg font-bold">₹{loan.approvalDetails?.approvedAmount?.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{loan.loanDetails.purpose}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLoan && (
        <>
          {/* Loan Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Loan Details</CardTitle>
                  <CardDescription>Application: {selectedLoan.applicationNumber}</CardDescription>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Loan Amount</p>
                  <p className="text-2xl font-bold">₹{selectedLoan.approvalDetails?.approvedAmount?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-2xl font-bold">₹{selectedLoan.emiDetails?.remainingBalance?.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
                  <p className="text-2xl font-bold">₹{selectedLoan.emiDetails?.emiAmount?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{selectedLoan.approvalDetails?.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Term</p>
                  <p className="font-medium">{selectedLoan.approvalDetails?.approvedTenure} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">EMIs Paid</p>
                  <p className="font-medium">{selectedLoan.emiDetails?.paidEmis}/{selectedLoan.emiDetails?.totalEmis}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment Due</p>
                  <p className="font-medium text-amber-600">
                    {selectedLoan.emiDetails?.nextEmiDate ? 
                      new Date(selectedLoan.emiDetails.nextEmiDate).toLocaleDateString() : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
              
              <div className="relative pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ 
                      width: `${((selectedLoan.emiDetails?.paidEmis || 0) / (selectedLoan.emiDetails?.totalEmis || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You've paid {Math.round(((selectedLoan.emiDetails?.paidEmis || 0) / (selectedLoan.emiDetails?.totalEmis || 1)) * 100)}% of your total EMIs
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button onClick={() => setPayEmiDialogOpen(true)}>Pay EMI Now</Button>
              <Button variant="outline" onClick={() => setPrepayDialogOpen(true)}>Prepay Loan</Button>
              <Button variant="outline" onClick={handleDownloadStatement}>
                <Download className="mr-2 h-4 w-4" />
                Loan Statement
              </Button>
              <Button variant="outline" onClick={handleSetReminder}>
                <Bell className="mr-2 h-4 w-4" />
                Set Reminder
              </Button>
            </CardFooter>
          </Card>

          {/* EMI Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>EMI Payment History</CardTitle>
              <CardDescription>View your past and upcoming EMI payments</CardDescription>
            </CardHeader>
            <CardContent>
              {emiSchedule.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>EMI #</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emiSchedule.map((emi) => (
                      <TableRow key={emi._id}>
                        <TableCell>{emi.emiNumber}</TableCell>
                        <TableCell>{new Date(emi.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>₹{emi.emiAmount.toLocaleString()}</TableCell>
                        <TableCell>₹{emi.principalAmount.toLocaleString()}</TableCell>
                        <TableCell>₹{emi.interestAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emi.status === 'paid' ? 'bg-green-100 text-green-800' : 
                            emi.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {emi.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {emi.paymentDate ? new Date(emi.paymentDate).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No EMI schedule available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Pay EMI Dialog */}
      <Dialog open={payEmiDialogOpen} onOpenChange={setPayEmiDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay EMI</DialogTitle>
            <DialogDescription>
              Make your monthly EMI payment for Loan {selectedLoan?.applicationNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>EMI Amount</Label>
              <div className="text-lg font-bold">₹{selectedLoan?.emiDetails?.emiAmount?.toLocaleString()}</div>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <div>
                {selectedLoan?.emiDetails?.nextEmiDate ? 
                  new Date(selectedLoan.emiDetails.nextEmiDate).toLocaleDateString() : 
                  'N/A'
                }
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="net_banking" id="net_banking" />
                  <Label htmlFor="net_banking">Net Banking</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayEmiDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayEMI} disabled={processingPayment}>
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prepay Loan Dialog */}
      <Dialog open={prepayDialogOpen} onOpenChange={setPrepayDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Prepay Loan</DialogTitle>
            <DialogDescription>
              Make a prepayment to reduce your loan tenure or EMI amount
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Outstanding Balance</Label>
              <div className="text-lg font-bold">₹{selectedLoan?.emiDetails?.remainingBalance?.toLocaleString()}</div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="full-prepay"
                  checked={isFullPrepay}
                  onChange={(e) => setIsFullPrepay(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="full-prepay">Full Prepayment</Label>
              </div>
            </div>
            
            {!isFullPrepay && (
              <div className="grid gap-2">
                <Label htmlFor="prepay-amount">Prepayment Amount</Label>
                <Input
                  id="prepay-amount"
                  placeholder="Enter amount"
                  type="number"
                  value={prepayAmount}
                  onChange={(e) => setPrepayAmount(e.target.value)}
                  disabled={isFullPrepay}
                />
                {Number(prepayAmount) > (selectedLoan?.emiDetails?.remainingBalance || 0) && (
                  <p className="text-sm text-red-500">
                    Amount cannot exceed outstanding balance
                  </p>
                )}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card_prepay" />
                  <Label htmlFor="credit_card_prepay">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi_prepay" />
                  <Label htmlFor="upi_prepay">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="net_banking" id="net_banking_prepay" />
                  <Label htmlFor="net_banking_prepay">Net Banking</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrepayDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrepayLoan} 
              disabled={processingPayment || (!isFullPrepay && (!prepayAmount || Number(prepayAmount) <= 0 || Number(prepayAmount) > (selectedLoan?.emiDetails?.remainingBalance || 0)))}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanManagement;
