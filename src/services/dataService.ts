
import { apiRequest } from './api';
import { HealthCard, Loan, Transaction, Appointment } from '@/types/app.types';

// Health Card Services
export const fetchUserHealthCard = async (): Promise<HealthCard> => {
  try {
    const response = await apiRequest('/health-cards');
    return response;
  } catch (error) {
    console.error('Failed to fetch health card:', error);
    throw error;
  }
};

export const createHealthCard = async (): Promise<HealthCard> => {
  try {
    const response = await apiRequest('/health-cards', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Failed to create health card:', error);
    throw error;
  }
};

// Loan Services
export const fetchUserLoans = async (): Promise<Loan[]> => {
  try {
    const response = await apiRequest('/loans');
    return response;
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    throw error;
  }
};

export const applyForLoan = async (loanData: {
  amount: number;
  termMonths: number;
  purpose: string;
  description?: string;
  hospital_id?: string;
}): Promise<any> => {
  try {
    const response = await apiRequest('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData)
    });
    return response;
  } catch (error) {
    console.error('Failed to apply for loan:', error);
    throw error;
  }
};

// Transaction Services
export const fetchUserTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await apiRequest('/transactions');
    return response;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

// Hospital Services (for payment processing)
export const fetchPatientBySearch = async (searchTerm: string): Promise<any> => {
  try {
    const response = await apiRequest(`/users/search?q=${encodeURIComponent(searchTerm)}`);
    return response;
  } catch (error) {
    console.error('Failed to search patient:', error);
    throw error;
  }
};

export const fetchPatientHealthCard = async (userId: string): Promise<HealthCard> => {
  try {
    const response = await apiRequest(`/health-cards/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch patient health card:', error);
    throw error;
  }
};

// Dashboard Analytics
export const fetchDashboardAnalytics = async (): Promise<any> => {
  try {
    const [healthCard, loans, transactions] = await Promise.all([
      fetchUserHealthCard().catch(() => null),
      fetchUserLoans().catch(() => []),
      fetchUserTransactions().catch(() => [])
    ]);

    return {
      healthCard,
      loans,
      transactions,
      summary: {
        totalBalance: healthCard?.balance || 0,
        activeLoans: loans.filter((loan: Loan) => loan.status === 'approved').length,
        totalTransactions: transactions.length,
        monthlySpending: transactions
          .filter((t: Transaction) => {
            const transactionDate = new Date(t.created_at);
            const currentMonth = new Date();
            return (
              transactionDate.getMonth() === currentMonth.getMonth() &&
              transactionDate.getFullYear() === currentMonth.getFullYear() &&
              t.type === 'payment'
            );
          })
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      }
    };
  } catch (error) {
    console.error('Failed to fetch dashboard analytics:', error);
    throw error;
  }
};

// Mock appointments service (to be replaced with actual backend integration)
export const fetchUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    // This would be replaced with actual API call once appointments backend is implemented
    const mockAppointments: Appointment[] = [
      {
        id: "1",
        patientName: "Current User",
        patientId: userId,
        hospitalName: "City General Hospital",
        hospitalId: "h1",
        doctorName: "Dr. Smith",
        specialty: "Cardiology",
        date: "2024-01-15",
        time: "10:00 AM",
        status: "confirmed",
        reason: "Regular checkup",
        notes: "Routine cardiac examination"
      },
      {
        id: "2",
        patientName: "Current User",
        patientId: userId,
        hospitalName: "Wellness Center",
        hospitalId: "h2",
        doctorName: "Dr. Johnson",
        specialty: "General Medicine",
        date: "2024-01-20",
        time: "2:00 PM",
        status: "pending",
        reason: "Follow-up consultation",
        notes: "Post-treatment follow-up"
      }
    ];
    
    return mockAppointments;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    throw error;
  }
};
