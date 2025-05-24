
import React from "react";

interface LoanApplicationEntryProps {
  // You can expand this as needed; for now, acts as a wrapper for the application's first step
  children: React.ReactNode;
}

const LoanApplicationEntry: React.FC<LoanApplicationEntryProps> = ({ children }) => (
  <div className="max-w-2xl mx-auto rounded-lg shadow bg-white p-6">{children}</div>
);

export default LoanApplicationEntry;
