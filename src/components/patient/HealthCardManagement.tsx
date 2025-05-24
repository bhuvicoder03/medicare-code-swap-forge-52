
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Plus, Download, Eye, EyeOff, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchUserHealthCard, createHealthCard, fetchUserTransactions } from "@/services/dataService";
import { topUpHealthCard } from "@/services/paymentGatewayService";
import { HealthCard, Transaction } from "@/types/app.types";

const HealthCardManagement = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [healthCard, setHealthCard] = useState<HealthCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processingTopUp, setProcessingTopUp] = useState(false);

  useEffect(() => {
    loadHealthCardData();
  }, [authState.user]);

  const loadHealthCardData = async () => {
    try {
      setIsLoading(true);
      const [cardData, transactionData] = await Promise.all([
        fetchUserHealthCard().catch(() => null),
        fetchUserTransactions().catch(() => [])
      ]);
      
      setHealthCard(cardData);
      setTransactions(transactionData.filter(t => 
        t.description?.toLowerCase().includes('health card') || 
        t.description?.toLowerCase().includes('top-up')
      ));
    } catch (error) {
      console.error("Failed to load health card data:", error);
      toast({
        title: "Error",
        description: "Failed to load health card data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = async () => {
    try {
      setIsLoading(true);
      const newCard = await createHealthCard();
      setHealthCard(newCard);
      toast({
        title: "Health Card Created",
        description: "Your health card has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create health card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!healthCard || !topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid top-up amount.",
        variant: "destructive",
      });
      return;
    }

    setProcessingTopUp(true);
    
    try {
      const response = await topUpHealthCard(
        healthCard.id,
        parseFloat(topUpAmount),
        paymentMethod
      );
      
      if (response.success) {
        // Reload health card data to get updated balance
        await loadHealthCardData();
        setTopUpDialogOpen(false);
        setTopUpAmount("");
        
        toast({
          title: "Top-up Successful",
          description: `₹${topUpAmount} has been added to your health card.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Top-up Failed",
        description: error.message || "Failed to process top-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingTopUp(false);
    }
  };

  const handleDownloadStatement = () => {
    toast({
      title: "Statement Download",
      description: "Your health card statement is being prepared for download.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!healthCard) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>No Health Card Found</CardTitle>
          <CardDescription>
            You don't have a health card yet. Create one to start using our medical services.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4 w-16 h-16 mx-auto flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-muted-foreground mb-6">
            With a health card, you can easily pay for medical services, maintain a balance, and track your medical expenses.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleCreateCard}>
            <Plus className="mr-2 h-4 w-4" />
            Create Health Card
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Card Display */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-semibold opacity-90">Rimedicare Health Card</h3>
              <p className="text-sm opacity-75">{healthCard.status?.toUpperCase()} CARD</p>
            </div>
            <CreditCard className="h-8 w-8 opacity-75" />
          </div>
          
          <div className="space-y-4">
            <div className="font-mono text-xl tracking-wider">
              {healthCard.card_number || healthCard.cardNumber || "•••• •••• •••• ••••"}
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-75 mb-1">CARD HOLDER</p>
                <p className="font-medium">
                  {authState.user?.firstName} {authState.user?.lastName}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs opacity-75 mb-1">BALANCE</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {showBalance ? `₹${(healthCard.balance || 0).toLocaleString()}` : "₹••••"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-1 h-auto"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs opacity-75">
              <span>
                ISSUED: {healthCard.issue_date ? new Date(healthCard.issue_date).toLocaleDateString() : 'N/A'}
              </span>
              <span>
                EXPIRES: {healthCard.expiry_date ? new Date(healthCard.expiry_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={() => setTopUpDialogOpen(true)} className="h-16">
          <Plus className="mr-2 h-5 w-5" />
          Top Up Card
        </Button>
        
        <Button variant="outline" onClick={handleDownloadStatement} className="h-16">
          <Download className="mr-2 h-5 w-5" />
          Download Statement
        </Button>
        
        <Button variant="outline" onClick={loadHealthCardData} className="h-16">
          <ArrowUpRight className="mr-2 h-5 w-5" />
          Refresh Data
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Health Card Transactions</CardTitle>
          <CardDescription>Your latest health card activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'payment' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.type === 'payment' ? 
                        <ArrowDownRight className="h-4 w-4" /> : 
                        <ArrowUpRight className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'payment' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'payment' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Dialog */}
      <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Top Up Health Card</DialogTitle>
            <DialogDescription>
              Add money to your health card for easy payments at hospitals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay">Razorpay (Cards, UPI, Net Banking)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fallback" id="fallback" />
                  <Label htmlFor="fallback">Fallback Payment (Demo)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTopUp} 
              disabled={processingTopUp || !topUpAmount || parseFloat(topUpAmount) <= 0}
            >
              {processingTopUp ? "Processing..." : "Top Up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthCardManagement;
