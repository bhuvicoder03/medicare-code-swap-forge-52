
import React from "react";
import { LoanApplication } from "@/services/loanService";
import LoanStatusChecker from "./LoanStatusChecker";

interface LoanPatientStatusTableProps {
  loans: LoanApplication[];
}

const LoanPatientStatusTable: React.FC<LoanPatientStatusTableProps> = ({ loans }) => (
  <div>
    {loans.length === 0
      ? <p>You have no loan applications.</p>
      : loans.map(loan => (
        <div className="mb-8" key={loan._id}>
          <LoanStatusChecker loan={loan} />
        </div>
      ))
    }
  </div>
);

export default LoanPatientStatusTable;
