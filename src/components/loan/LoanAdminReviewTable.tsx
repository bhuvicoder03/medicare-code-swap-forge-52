
import React from "react";
import { LoanApplication } from "@/services/loanService";
import { Button } from "@/components/ui/button";

interface LoanAdminReviewTableProps {
  loans: LoanApplication[];
  onApprove: (loanId: string) => void;
  onReject: (loanId: string) => void;
}

const LoanAdminReviewTable: React.FC<LoanAdminReviewTableProps> = ({ loans, onApprove, onReject }) => (
  <table className="min-w-full text-sm border">
    <thead>
      <tr className="bg-gray-100">
        <th className="py-2 px-4">Number</th>
        <th>Patient</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Requested</th>
        <th>Action</th>
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
          <td>
            {loan.status === "submitted" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onApprove(loan._id!)}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => onReject(loan._id!)}>Reject</Button>
              </div>
            )}
            {loan.status !== "submitted" && <span>-</span>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default LoanAdminReviewTable;
