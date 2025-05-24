
import React from "react";
import { LoanApplication } from "@/services/loanService";

interface LoanHospitalReviewTableProps {
  loans: LoanApplication[];
}

const LoanHospitalReviewTable: React.FC<LoanHospitalReviewTableProps> = ({ loans }) => (
  <table className="min-w-full border text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="py-2 px-4">Application</th>
        <th>Patient</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {loans.map(loan => (
        <tr key={loan._id}>
          <td className="px-4 py-2">{loan.applicationNumber}</td>
          <td>{loan.personalDetails.fullName}</td>
          <td>₹{loan.loanDetails.amount.toLocaleString()}</td>
          <td>{loan.status}</td>
          <td>{loan.applicationDate ? new Date(loan.applicationDate).toLocaleDateString() : ""}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default LoanHospitalReviewTable;
