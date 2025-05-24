import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Check, X, Edit, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { loanService, LoanApplication } from "@/services/loanService";

const LoanApproval = () => {
  const { toast } = useToast();
  
  // State management
  const [pendingLoans, setPendingLoans] = useState<LoanApplication[]>([]);
  const [recentLoans, setRecentLoans] = useState<LoanApplication[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Form states
  const [loanTerms, setLoanTerms] = useState({
    amount: 0,
    interestRate: "12",
    tenure: "24",
    processingFee: 0
  });
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      console.log('Fetching loans for admin...');
      const allLoans = await loanService.getAllLoans();
      
      console.log('Fetched loans:', allLoans);
      
      // Ensure allLoans is an array
      const loansArray = Array.isArray(allLoans) ? allLoans : [];
      
      const pending = loansArray.filter(loan => 
        ['submitted', 'under_review', 'credit_check'].includes(loan.status)
      );
      const recent = loansArray.filter(loan => 
        ['approved', 'rejected', 'disbursed'].includes(loan.status)
      ).slice(0, 10); // Show only recent 10
      
      console.log('Pending loans:', pending);
      console.log('Recent loans:', recent);
      
      setPendingLoans(pending);
      setRecentLoans(recent);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch loan applications.",
      });
      // Set empty arrays on error to prevent filter issues
      setPendingLoans([]);
      setRecentLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLoan = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setLoanTerms({
      amount: loan.loanDetails.amount,
      interestRate: "12",
      tenure: "24",
      processingFee: Math.round(loan.loanDetails.amount * 0.02) // 2% processing fee
    });
  };

  const calculateEMI = () => {
    const { amount, interestRate, tenure } = loanTerms;
    const monthlyRate = Number(interestRate) / 100 / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, Number(tenure))) / 
                 (Math.pow(1 + monthlyRate, Number(tenure)) - 1);
    return Math.round(emi);
  };

  const handleApproveLoan = async () => {
    if (!selectedLoan) return;

    setProcessing(true);
    try {
      const approvalDetails = {
        approvedAmount: loanTerms.amount,
        interestRate: Number(loanTerms.interestRate),
        processingFee: loanTerms.processingFee,
        emi: calculateEMI(),
        approvedTenure: Number(loanTerms.tenure)
      };

      await loanService.updateLoanStatus(selectedLoan._id!, 'approved', { approvalDetails });
      
      toast({
        title: "Loan Approved",
        description: `Loan ${selectedLoan.applicationNumber} has been approved successfully.`,
      });
      
      setSelectedLoan(null);
      await fetchLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve loan application.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectLoan = async () => {
    if (!selectedLoan || !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the loan.",
      });
      return;
    }

    setProcessing(true);
    try {
      const rejectionDetails = {
        reason: rejectionReason
      };

      await loanService.updateLoanStatus(selectedLoan._id!, 'rejected', { rejectionDetails });
      
      toast({
        title: "Loan Rejected",
        description: `Loan ${selectedLoan.applicationNumber} has been rejected.`,
      });
      
      setSelectedLoan(null);
      setRejectionReason("");
      await fetchLoans();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject loan application.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading loan applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Loan Applications</CardTitle>
              <CardDescription>Review and process loan requests ({pendingLoans.length} pending)</CardDescription>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {pendingLoans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLoans.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-medium">{loan.applicationNumber}</TableCell>
                    <TableCell>{loan.personalDetails.fullName}</TableCell>
                    <TableCell>₹{loan.loanDetails.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.loanDetails.purpose}</TableCell>
                    <TableCell>₹{loan.employmentDetails.monthlyIncome.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {loan.applicationDate ? new Date(loan.applicationDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewLoan(loan)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        
                        {selectedLoan && (
                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Loan Application Review</DialogTitle>
                              <DialogDescription>
                                Application: {selectedLoan.applicationNumber}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-6 py-4">
                              {/* Personal Details */}
                              <div className="space-y-4">
                                <h4 className="font-medium">Personal Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Full Name</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.personalDetails.fullName}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.personalDetails.email}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.personalDetails.phone}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>PAN Number</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.personalDetails.panNumber}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Employment Details */}
                              <div className="space-y-4">
                                <h4 className="font-medium">Employment Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Employment Type</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.employmentDetails.type}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Company Name</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.employmentDetails.companyName}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Monthly Income</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      ₹{selectedLoan.employmentDetails.monthlyIncome.toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Work Experience</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.employmentDetails.workExperience || 'N/A'} years
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Loan Details */}
                              <div className="space-y-4">
                                <h4 className="font-medium">Loan Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Requested Amount</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      ₹{selectedLoan.loanDetails.amount.toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Purpose</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.loanDetails.purpose}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Requested Tenure</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.loanDetails.tenure} months
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Hospital</Label>
                                    <div className="p-2 border rounded-md bg-gray-50">
                                      {selectedLoan.loanDetails.hospitalName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Credit Information */}
                              {selectedLoan.creditDetails && (
                                <div className="space-y-4">
                                  <h4 className="font-medium">Credit Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Credit Score</Label>
                                      <div className="p-2 border rounded-md bg-gray-50">
                                        {selectedLoan.creditDetails.creditScore || 'Not available'}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Account Aggregator Score</Label>
                                      <div className="p-2 border rounded-md bg-gray-50">
                                        {selectedLoan.creditDetails.accountAggregatorScore || 'Not available'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Approval Terms */}
                              <div className="space-y-4">
                                <h4 className="font-medium">Approval Terms</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="approved-amount">Approved Amount</Label>
                                    <Input 
                                      id="approved-amount" 
                                      value={loanTerms.amount} 
                                      onChange={(e) => setLoanTerms({...loanTerms, amount: Number(e.target.value)})}
                                      type="number"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="processing-fee">Processing Fee</Label>
                                    <Input 
                                      id="processing-fee" 
                                      value={loanTerms.processingFee} 
                                      onChange={(e) => setLoanTerms({...loanTerms, processingFee: Number(e.target.value)})}
                                      type="number"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                    <Select
                                      value={loanTerms.interestRate}
                                      onValueChange={(value) => setLoanTerms({...loanTerms, interestRate: value})}
                                    >
                                      <SelectTrigger id="interestRate">
                                        <SelectValue placeholder="Select rate" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="9">9%</SelectItem>
                                        <SelectItem value="10">10%</SelectItem>
                                        <SelectItem value="11">11%</SelectItem>
                                        <SelectItem value="12">12%</SelectItem>
                                        <SelectItem value="13">13%</SelectItem>
                                        <SelectItem value="14">14%</SelectItem>
                                        <SelectItem value="15">15%</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="tenure">Tenure (Months)</Label>
                                    <Select
                                      value={loanTerms.tenure}
                                      onValueChange={(value) => setLoanTerms({...loanTerms, tenure: value})}
                                    >
                                      <SelectTrigger id="tenure">
                                        <SelectValue placeholder="Select tenure" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="12">12 Months</SelectItem>
                                        <SelectItem value="18">18 Months</SelectItem>
                                        <SelectItem value="24">24 Months</SelectItem>
                                        <SelectItem value="36">36 Months</SelectItem>
                                        <SelectItem value="48">48 Months</SelectItem>
                                        <SelectItem value="60">60 Months</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <Label>Monthly EMI</Label>
                                  <div className="text-xl font-bold text-blue-800">
                                    ₹{calculateEMI().toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Rejection Reason */}
                              <div className="space-y-2">
                                <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                                <Textarea
                                  id="rejection-reason"
                                  placeholder="Enter reason for rejection..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <div className="flex gap-2 w-full">
                                <Button 
                                  variant="outline" 
                                  className="flex-1" 
                                  onClick={handleRejectLoan}
                                  disabled={processing}
                                >
                                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                                  Reject
                                </Button>
                                <Button 
                                  className="flex-1" 
                                  onClick={handleApproveLoan}
                                  disabled={processing}
                                >
                                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                  Approve
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending loan applications</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Loan Applications</CardTitle>
          <CardDescription>Recently processed loan requests</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLoans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application #</TableHead>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Decision Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-medium">{loan.applicationNumber}</TableCell>
                    <TableCell>{loan.personalDetails.fullName}</TableCell>
                    <TableCell>₹{loan.loanDetails.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.loanDetails.purpose}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {loan.applicationDate ? new Date(loan.applicationDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {loan.approvalDetails?.approvalDate ? 
                        new Date(loan.approvalDetails.approvalDate).toLocaleDateString() : 
                        loan.rejectionDetails?.rejectionDate ? 
                        new Date(loan.rejectionDetails.rejectionDate).toLocaleDateString() : 
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No recent loan applications</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto">View All Applications</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoanApproval;
