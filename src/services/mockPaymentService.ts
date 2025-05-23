
import { Transaction } from "@/types/app.types";
import { v4 as uuidv4 } from 'uuid';

interface PaymentRequest {
  amount: number;
  currency: string;
  method: string;
  description: string;
  user_id: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  receipt?: string;
}

// Mock payment processing
export const processPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  console.log("Processing payment:", paymentData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Random success (90% success rate)
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    const transactionId = uuidv4();
    const receipt = `REC-${Math.floor(Math.random() * 1000000)}`;
    
    // Create a transaction record
    await createTransaction({
      id: transactionId,
      user_id: paymentData.user_id,
      amount: paymentData.amount,
      type: 'payment',
      description: paymentData.description,
      status: 'completed',
      created_at: new Date().toISOString()
    });
    
    return {
      success: true,
      message: "Payment processed successfully",
      transactionId,
      receipt
    };
  } else {
    return {
      success: false,
      message: "Payment failed. Please try again or use a different payment method."
    };
  }
};

// Simulated EMI payment
export const payEMI = async (
  loanId: string,
  amount: number,
  userId: string
): Promise<PaymentResponse> => {
  console.log(`Processing EMI payment for loan ${loanId}:`, amount);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Random success (95% success rate)
  const isSuccess = Math.random() > 0.05;
  
  if (isSuccess) {
    const transactionId = uuidv4();
    const receipt = `EMIPAY-${Math.floor(Math.random() * 1000000)}`;
    
    // Create a transaction record
    await createTransaction({
      id: transactionId,
      user_id: userId,
      amount: amount,
      type: 'payment',
      description: `EMI payment for loan ${loanId}`,
      status: 'completed',
      created_at: new Date().toISOString()
    });
    
    return {
      success: true,
      message: "EMI payment successful",
      transactionId,
      receipt
    };
  } else {
    return {
      success: false,
      message: "EMI payment failed. Please try again or contact support."
    };
  }
};

// Health card top-up
export const topUpHealthCard = async (
  cardId: string,
  amount: number,
  userId: string,
  paymentMethod: string
): Promise<PaymentResponse> => {
  console.log(`Processing health card top-up for ${cardId}:`, amount);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Random success (95% success rate)
  const isSuccess = Math.random() > 0.05;
  
  if (isSuccess) {
    const transactionId = uuidv4();
    const receipt = `HCTOPUP-${Math.floor(Math.random() * 1000000)}`;
    
    // Create a transaction record
    await createTransaction({
      id: transactionId,
      user_id: userId,
      amount: amount,
      type: 'payment',
      description: `Health card top-up for card ${cardId}`,
      status: 'completed',
      created_at: new Date().toISOString()
    });
    
    return {
      success: true,
      message: "Health card topped up successfully",
      transactionId,
      receipt
    };
  } else {
    return {
      success: false,
      message: "Top-up failed. Please try again or use a different payment method."
    };
  }
};

// Store transactions in memory
const transactions: Transaction[] = [];

// Create a transaction record
const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
  transactions.push(transaction);
  return transaction;
};

// Get user transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  return transactions.filter(transaction => transaction.user_id === userId);
};
