
import { apiRequest } from './api';

export interface PaymentGatewayRequest {
  amount: number;
  currency?: string;
  description: string;
  user_id: string;
  order_id?: string;
  payment_method?: 'razorpay' | 'fallback';
  metadata?: Record<string, any>;
}

export interface PaymentGatewayResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
  order_id?: string;
  payment_url?: string;
  gateway_response?: any;
  fallback_used?: boolean;
}

export interface LoanRequest {
  user_id: string;
  amount: number;
  purpose: string;
  tenure_months: number;
  hospital_id?: string;
  description?: string;
}

export interface LoanResponse {
  success: boolean;
  message: string;
  loan_id?: string;
  status?: 'pending' | 'approved' | 'rejected';
  monthly_payment?: number;
  interest_rate?: number;
}

// Razorpay Payment Integration
export const initiateRazorpayPayment = async (paymentData: PaymentGatewayRequest): Promise<PaymentGatewayResponse> => {
  try {
    console.log('Initiating Razorpay payment:', paymentData);
    
    const response = await apiRequest('/payments/razorpay/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    
    return response;
  } catch (error) {
    console.error('Razorpay payment initiation failed:', error);
    throw error;
  }
};

// Verify Razorpay Payment
export const verifyRazorpayPayment = async (payment_id: string, order_id: string, signature: string): Promise<PaymentGatewayResponse> => {
  try {
    const response = await apiRequest('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({
        payment_id,
        order_id,
        signature
      })
    });
    
    return response;
  } catch (error) {
    console.error('Razorpay payment verification failed:', error);
    throw error;
  }
};

// Fallback Payment Processing
export const processFallbackPayment = async (paymentData: PaymentGatewayRequest): Promise<PaymentGatewayResponse> => {
  try {
    console.log('Processing fallback payment:', paymentData);
    
    const response = await apiRequest('/payments/fallback', {
      method: 'POST',
      body: JSON.stringify({
        ...paymentData,
        payment_method: 'fallback'
      })
    });
    
    return response;
  } catch (error) {
    console.error('Fallback payment processing failed:', error);
    throw error;
  }
};

// Main Payment Processing with Fallback
export const processPaymentWithGateway = async (paymentData: PaymentGatewayRequest): Promise<PaymentGatewayResponse> => {
  try {
    // First attempt: Razorpay
    console.log('Attempting Razorpay payment...');
    const razorpayResponse = await initiateRazorpayPayment(paymentData);
    
    if (razorpayResponse.success) {
      return razorpayResponse;
    }
    
    throw new Error('Razorpay payment failed');
  } catch (error) {
    console.warn('Razorpay payment failed, attempting fallback:', error);
    
    try {
      // Fallback: Mock successful payment for testing
      const fallbackResponse = await processFallbackPayment(paymentData);
      return {
        ...fallbackResponse,
        fallback_used: true
      };
    } catch (fallbackError) {
      console.error('Both payment methods failed:', fallbackError);
      throw new Error('Payment processing completely failed');
    }
  }
};

// Loan Management
export const applyForLoan = async (loanData: LoanRequest): Promise<LoanResponse> => {
  try {
    console.log('Applying for loan:', loanData);
    
    const response = await apiRequest('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData)
    });
    
    return response;
  } catch (error) {
    console.error('Loan application failed:', error);
    throw error;
  }
};

// EMI Payment
export const payLoanEMI = async (loan_id: string, amount: number): Promise<PaymentGatewayResponse> => {
  try {
    const response = await apiRequest(`/loans/${loan_id}/pay-emi`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
    
    return response;
  } catch (error) {
    console.error('EMI payment failed:', error);
    throw error;
  }
};

// Loan Prepayment
export const prepayLoan = async (loan_id: string, amount: number, type: 'partial' | 'full'): Promise<PaymentGatewayResponse> => {
  try {
    const response = await apiRequest(`/loans/${loan_id}/prepay`, {
      method: 'POST',
      body: JSON.stringify({ amount, type })
    });
    
    return response;
  } catch (error) {
    console.error('Loan prepayment failed:', error);
    throw error;
  }
};

// Health Card Payment
export const processHealthCardPayment = async (
  patient_id: string, 
  amount: number, 
  description: string, 
  hospital_id?: string
): Promise<PaymentGatewayResponse> => {
  try {
    const response = await apiRequest('/health-cards/payment', {
      method: 'POST',
      body: JSON.stringify({
        patient_id,
        amount,
        description,
        hospital_id
      })
    });
    
    return response;
  } catch (error) {
    console.error('Health card payment failed:', error);
    throw error;
  }
};

// Health Card Top-up
export const topUpHealthCard = async (
  card_id: string, 
  amount: number, 
  payment_method: string = 'razorpay'
): Promise<PaymentGatewayResponse> => {
  try {
    const response = await apiRequest(`/health-cards/${card_id}/topup`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        payment_method
      })
    });
    
    return response;
  } catch (error) {
    console.error('Health card top-up failed:', error);
    throw error;
  }
};
