
// Guarantor loan should not be available for now, show notice
const GuarantorLoanApplication = () => {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Guarantor Loan Application Disabled</h2>
        <p className="text-yellow-700 mb-4">
          Applying for a medical loan on behalf of another patient as a guarantor is temporarily disabled. 
          Please check back later or apply as a patient.
        </p>
      </div>
    </div>
  );
};

export default GuarantorLoanApplication;
