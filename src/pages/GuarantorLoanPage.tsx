
import GuarantorLoanApplication from '@/components/loan/GuarantorLoanApplication';

const GuarantorLoanPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">RI Medicare</h1>
          <p className="text-gray-600">Guarantor Loan Application Portal</p>
        </div>
      </div>
      
      <div className="py-8">
        <GuarantorLoanApplication />
      </div>
    </div>
  );
};

export default GuarantorLoanPage;
