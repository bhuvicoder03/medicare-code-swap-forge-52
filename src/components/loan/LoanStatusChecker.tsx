
import React from "react";
import { CheckCircle, Hourglass, XCircle, AlertCircle } from "lucide-react";
import { LoanApplication } from "@/services/loanService";

interface LoanStatusCheckerProps {
  loan: LoanApplication;
}

const getStatusUI = (loan: LoanApplication) => {
  switch (loan.status) {
    case "draft":
      return {
        icon: <Hourglass className="text-gray-500 h-6 w-6" />,
        message: "Your application is in draft stage."
      };
    case "submitted":
      return {
        icon: <Hourglass className="text-blue-600 h-6 w-6" />,
        message: "Application submitted. Awaiting review."
      };
    case "under_review":
      return {
        icon: <Hourglass className="text-yellow-600 h-6 w-6" />,
        message: "Your application is under review."
      };
    case "credit_check":
      return {
        icon: <Hourglass className="text-amber-600 h-6 w-6" />,
        message: "We are performing a credit check."
      };
    case "approved":
      return {
        icon: <CheckCircle className="text-green-600 h-6 w-6" />,
        message: "Congratulations! Your loan is approved."
      };
    case "rejected":
      return {
        icon: <XCircle className="text-red-600 h-6 w-6" />,
        message: `Rejected${loan.rejectionDetails?.reason ? ": " + loan.rejectionDetails.reason : ""}`
      };
    case "additional_documents_needed":
      return {
        icon: <AlertCircle className="text-amber-500 h-6 w-6" />,
        message: "Additional documents required. Please check your email."
      };
    default:
      return {
        icon: <Hourglass className="text-gray-500 h-6 w-6" />,
        message: "Processing…"
      };
  }
};

const LoanStatusChecker: React.FC<LoanStatusCheckerProps> = ({ loan }) => {
  const { icon, message } = getStatusUI(loan);

  // Only handle 'patient' for applicantType
  if (loan.applicantType !== "patient") {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow text-center max-w-lg mx-auto">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold">{message}</h3>
      {loan.comments && loan.comments.length > 0 && (
        <div className="mt-4 border-t pt-4 text-left">
          <div className="text-sm font-medium mb-2">Application Timeline:</div>
          <ul className="text-xs space-y-1">
            {loan.comments.map((comment, idx) => (
              <li key={idx}>
                <span className="font-medium">{comment.statusChange ? comment.statusChange + ": " : ""}</span>
                "{comment.message}" — {new Date(comment.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoanStatusChecker;
