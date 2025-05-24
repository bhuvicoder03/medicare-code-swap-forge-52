
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { securePaymentService, EmiPaymentRequest, PrepaymentRequest } from "@/services/securePaymentService";

interface EmiPayment {
  _id: string;
  emiNumber: number;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
}

interface EmiPaymentProcessorProps {
  emi: EmiPayment;
  loanId: string;
  onPaymentSuccess: () => void;
}

const EmiPaymentProcessor: React.FC<EmiPaymentProcessorProps> = ({
  emi,
  loanId,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | 'prepay'>('full');

  const handleEmiPayment = async () => {
    if (!paymentMethod) {
      toast({
        variant: "destructive",
        title: "Payment method required",
        description: "Please select a payment method.",
      });
      return;
    }

    if (paymentType === 'partial' && !customAmount) {
      toast({
        variant: "destructive",
        title: "Amount required",
        description: "Please enter the payment amount.",
      });
      return;
    }

    setProcessing(true);

    try {
      const paymentData: EmiPaymentRequest = {
        emiId: emi._id,
        paymentMethod,
        ...(paymentType === 'partial' ? { amountPaid: parseFloat(customAmount) } : {})
      };

      const result = await securePaymentService.processEmiPayment(paymentData);

      if (result.success) {
        toast({
          title: "EMI Payment Successful",
          description: `EMI #${emi.emiNumber} has been paid successfully. Transaction ID: ${result.transactionId}`,
        });
        onPaymentSuccess();
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('EMI payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "An error occurred while processing the payment.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePrepayment = async () => {
    if (!paymentMethod || !customAmount) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select payment method and enter amount.",
      });
      return;
    }

    setProcessing(true);

    try {
      const prepaymentData: PrepaymentRequest = {
        loanId,
        amount: parseFloat(customAmount),
        paymentMethod
      };

      const result = await securePaymentService.processPrepayment(prepaymentData);

      if (result.success) {
        toast({
          title: "Prepayment Successful",
          description: `Prepayment of ₹${customAmount} has been processed successfully. Transaction ID: ${result.transactionId}`,
        });
        onPaymentSuccess();
      } else {
        throw new Error(result.error || 'Prepayment failed');
      }
    } catch (error: any) {
      console.error('Prepayment error:', error);
      toast({
        variant: "destructive",
        title: "Prepayment Failed",
        description: error.message || "An error occurred while processing the prepayment.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const isOverdue = new Date(emi.dueDate) < new Date() && emi.status === 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          EMI Payment (Secure Server-Side Processing)
        </CardTitle>
        <CardDescription>
          Pay your EMI securely through our server-side payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOverdue && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Overdue Payment</AlertTitle>
            <AlertDescription>
              This EMI is overdue. Please pay as soon as possible to avoid penalties.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-500">EMI Number</p>
            <p className="font-semibold">#{emi.emiNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="font-semibold">{new Date(emi.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">EMI Amount</p>
            <p className="font-semibold text-green-600">₹{emi.emiAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`font-semibold ${
              emi.status === 'paid' ? 'text-green-600' : 
              emi.status === 'overdue' ? 'text-red-600' : 'text-orange-600'
            }`}>
              {emi.status.charAt(0).toUpperCase() + emi.status.slice(1)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-type">Payment Type</Label>
            <Select value={paymentType} onValueChange={(value: 'full' | 'partial' | 'prepay') => setPaymentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full EMI Payment (₹{emi.emiAmount.toLocaleString()})</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="prepay">Loan Prepayment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(paymentType === 'partial' || paymentType === 'prepay') && (
            <div>
              <Label htmlFor="custom-amount">
                {paymentType === 'prepay' ? 'Prepayment Amount (₹)' : 'Payment Amount (₹)'}
              </Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="net_banking">Net Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={paymentType === 'prepay' ? handlePrepayment : handleEmiPayment}
            disabled={processing || emi.status === 'paid'}
          >
            {processing ? 'Processing Securely...' : 
             paymentType === 'prepay' ? 'Process Prepayment' : 
             `Pay ${paymentType === 'full' ? `₹${emi.emiAmount.toLocaleString()}` : 'Amount'} (Server-Side)`}
          </Button>

          {emi.status === 'paid' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">This EMI has been paid</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmiPaymentProcessor;
