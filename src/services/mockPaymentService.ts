
import { Transaction } from "./transactionService";
import { apiRequest } from "./api";
import { toast } from "@/hooks/use-toast";

// Mock payment statuses for simulation
type PaymentStatus = "success" | "pending" | "failed";

// Payment methods supported
export type PaymentMethod = "health_card" | "loan" | "credit_card" | "net_banking" | "upi";

// Payment request interface
export interface PaymentRequest {
  amount: number;
  patientId?: string;
  hospitalId?: string;
  description: string;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, any>;
}

// Payment response interface
export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  message: string;
  amount: number;
  timestamp: string;
  paymentMethod: PaymentMethod;
}

// Mock API delays (ms)
const API_DELAY = 1500;
const FAILURE_RATE = 0.1; // 10% chance of failure for testing fallbacks

/**
 * Process a payment with the mock payment service
 */
export const processPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  console.log("Processing payment:", request);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  
  // Simulate random failures (10% chance)
  const shouldFail = Math.random() < FAILURE_RATE;
  
  if (shouldFail) {
    console.error("Payment failed - random failure simulation");
    throw new Error("Payment processing failed. Please try again.");
  }
  
  // Generate mock transaction ID
  const transactionId = 'TRX-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  try {
    // In a real app, this would make an actual API request
    // For mock, we'll simulate creating a transaction record
    const transaction: Partial<Transaction> = {
      user: request.patientId || 'anonymous',
      amount: request.amount,
      type: request.paymentMethod === 'loan' ? 'charge' : 'payment',
      description: request.description,
      hospital: request.hospitalId || 'unknown',
      status: 'completed',
      date: new Date().toISOString()
    };
    
    // Attempt to record the transaction
    try {
      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction)
      });
      console.log("Transaction recorded successfully");
    } catch (error) {
      // If API fails, we still continue with the mock flow
      console.warn("Failed to record transaction:", error);
    }
    
    // Return successful response
    return {
      success: true,
      transactionId,
      status: "success",
      message: "Payment processed successfully",
      amount: request.amount,
      timestamp: new Date().toISOString(),
      paymentMethod: request.paymentMethod
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    
    // Return error response
    return {
      success: false,
      status: "failed",
      message: error instanceof Error ? error.message : "Unknown payment error",
      amount: request.amount,
      timestamp: new Date().toISOString(),
      paymentMethod: request.paymentMethod
    };
  }
};

/**
 * Process a refund with the mock payment service
 */
export const processRefund = async (transactionId: string, amount: number): Promise<PaymentResponse> => {
  console.log(`Processing refund for transaction ${transactionId} of amount ${amount}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  
  // Simulate random failures (10% chance)
  const shouldFail = Math.random() < FAILURE_RATE;
  
  if (shouldFail) {
    throw new Error("Refund processing failed. Please try again.");
  }
  
  // Return successful response
  return {
    success: true,
    transactionId: 'REF-' + transactionId.substring(4),
    status: "success",
    message: "Refund processed successfully",
    amount: amount,
    timestamp: new Date().toISOString(),
    paymentMethod: "health_card" // Default for refunds
  };
};

/**
 * Verify a payment status - useful for payment verification flows
 */
export const verifyPayment = async (transactionId: string): Promise<PaymentResponse> => {
  console.log(`Verifying payment status for transaction ${transactionId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, API_DELAY / 2));
  
  // For mock purposes, almost all verifications succeed
  const shouldFail = Math.random() < 0.05; // 5% failure rate
  
  if (shouldFail) {
    return {
      success: false,
      transactionId,
      status: "pending",
      message: "Payment verification is still processing",
      amount: 0, // Unknown at verification time
      timestamp: new Date().toISOString(),
      paymentMethod: "health_card" // Default
    };
  }
  
  // Return success
  return {
    success: true,
    transactionId,
    status: "success", 
    message: "Payment verified successfully",
    amount: Math.floor(Math.random() * 10000) + 1000, // Mock amount
    timestamp: new Date().toISOString(),
    paymentMethod: "health_card" // Default
  };
};

/**
 * Payment processor with fallback mechanisms
 * - Attempts payment up to 3 times
 * - Shows appropriate toast messages
 */
export const processPaymentWithFallback = async (
  request: PaymentRequest,
  onSuccess?: (response: PaymentResponse) => void,
  onError?: (error: Error) => void
): Promise<PaymentResponse | null> => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      toast({
        title: "Processing payment",
        description: attempts > 1 ? `Attempt ${attempts}...` : "Please wait while we process your payment."
      });
      
      const response = await processPayment(request);
      
      if (response.success) {
        toast({
          title: "Payment successful",
          description: `Transaction ID: ${response.transactionId}`
        });
        
        onSuccess?.(response);
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error(`Payment attempt ${attempts} failed:`, error);
      
      if (attempts >= maxAttempts) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message || "Unable to process payment after multiple attempts."
        });
        
        onError?.(error);
        return null;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Retrying payment",
        description: `Previous attempt failed: ${error.message}`
      });
    }
  }
  
  return null;
};
