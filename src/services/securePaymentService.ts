
import { api } from './api';

export interface PaymentRequest {
  patientId: string;
  amount: number;
  description: string;
  paymentType?: string;
}

export interface LoanPaymentRequest {
  patientId: string;
  amount: number;
  purpose: string;
  tenure: number;
  description?: string;
}

export interface EmiPaymentRequest {
  emiId: string;
  paymentMethod: string;
  amountPaid?: number;
}

export interface PrepaymentRequest {
  loanId: string;
  amount: number;
  paymentMethod: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  transaction?: any;
  loan?: any;
  emi?: any;
  error?: string;
}

class SecurePaymentService {
  async processHealthCardPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/process-health-card', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Health card payment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment processing failed'
      };
    }
  }

  async processLoanRequest(loanData: LoanPaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/process-loan-request', loanData);
      return response.data;
    } catch (error: any) {
      console.error('Loan request error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Loan request processing failed'
      };
    }
  }

  async processEmiPayment(emiData: EmiPaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/process-emi', emiData);
      return response.data;
    } catch (error: any) {
      console.error('EMI payment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'EMI payment processing failed'
      };
    }
  }

  async processPrepayment(prepaymentData: PrepaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments/process-prepayment', prepaymentData);
      return response.data;
    } catch (error: any) {
      console.error('Prepayment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Prepayment processing failed'
      };
    }
  }
}

export const securePaymentService = new SecurePaymentService();
