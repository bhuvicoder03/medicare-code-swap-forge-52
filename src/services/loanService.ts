
import { api } from './api';

export interface LoanApplication {
  _id?: string;
  applicationNumber?: string;
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    panNumber: string;
    aadhaarNumber: string;
  };
  employmentDetails: {
    type: 'salaried' | 'self_employed' | 'business';
    companyName: string;
    designation?: string;
    monthlyIncome: number;
    workExperience?: number;
    officeAddress?: string;
  };
  loanDetails: {
    amount: number;
    purpose: string;
    tenure: number;
    hospitalName?: string;
    hospitalId?: string;
    treatmentType?: string;
  };
  creditDetails?: {
    creditScore?: number;
    accountAggregatorScore?: number;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'credit_check' | 'approved' | 'rejected' | 'disbursed';
  approvalDetails?: {
    approvedAmount?: number;
    interestRate?: number;
    processingFee?: number;
    emi?: number;
    approvedTenure?: number;
    approvalDate?: string;
    disbursementDate?: string;
  };
  emiDetails?: {
    emiAmount?: number;
    totalEmis?: number;
    paidEmis?: number;
    nextEmiDate?: string;
    remainingBalance?: number;
  };
  applicationDate?: string;
}

export interface LoanOffer {
  _id: string;
  provider: string;
  offeredAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  processingFee: number;
  description?: string;
  terms?: string[];
  validUntil: string;
}

export interface EmiPayment {
  _id: string;
  emiNumber: number;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paymentMethod?: string;
  transactionId?: string;
  penaltyAmount?: number;
  totalPaidAmount?: number;
}

class LoanService {
  async getAllLoans(): Promise<LoanApplication[]> {
    const response = await api.get('/loans');
    return response.data;
  }

  async getLoanById(loanId: string): Promise<LoanApplication> {
    const response = await api.get(`/loans/${loanId}`);
    return response.data;
  }

  async createLoanApplication(applicationData: Omit<LoanApplication, '_id' | 'applicationNumber' | 'status' | 'applicationDate'>): Promise<{ loan: LoanApplication; applicationNumber: string }> {
    const response = await api.post('/loans/apply', applicationData);
    return response.data;
  }

  async updateLoanStatus(loanId: string, status: string, details?: any): Promise<LoanApplication> {
    const response = await api.put(`/loans/${loanId}/update-status`, {
      status,
      ...details
    });
    return response.data;
  }

  async getLoanOffers(loanId: string): Promise<LoanOffer[]> {
    const response = await api.get(`/loans/${loanId}/offers`);
    return response.data;
  }

  async selectLoanOffer(loanId: string, offerId: string): Promise<{ loan: LoanApplication; selectedOffer: LoanOffer }> {
    const response = await api.post(`/loans/${loanId}/select-offer`, { offerId });
    return response.data;
  }

  async getEmiSchedule(loanId: string): Promise<EmiPayment[]> {
    const response = await api.get(`/loans/${loanId}/emis`);
    return response.data;
  }

  async payEmi(emiId: string, paymentData: {
    paymentMethod: string;
    transactionId: string;
    amountPaid?: number;
  }): Promise<{ emi: EmiPayment; loan: LoanApplication }> {
    const response = await api.post(`/loans/emi/${emiId}/pay`, paymentData);
    return response.data;
  }

  async prepayLoan(loanId: string, prepaymentData: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
  }): Promise<LoanApplication> {
    const response = await api.post(`/loans/${loanId}/prepay`, prepaymentData);
    return response.data;
  }
}

export const loanService = new LoanService();
