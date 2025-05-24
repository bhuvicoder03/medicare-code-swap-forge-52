
import React from "react";
import { Button } from "@/components/ui/button";

interface AccountAnalysisStepProps {
  onComplete: (data: { score: number }) => void;
}

const AccountAnalysisStep: React.FC<AccountAnalysisStepProps> = ({ onComplete }) => (
  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">Account Aggregator Analysis</h3>
    <p className="mb-4">We're analyzing your financial accounts for loan eligibility...</p>
    <div className="flex justify-center my-8">
      <Button
        onClick={() => onComplete({ score: 84 })}
        className="w-full max-w-md"
      >
        Simulate Account Analysis
      </Button>
    </div>
  </div>
);

export default AccountAnalysisStep;
