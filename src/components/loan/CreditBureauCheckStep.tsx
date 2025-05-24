
import React from "react";
import { Button } from "@/components/ui/button";

interface CreditBureauCheckStepProps {
  onComplete: (data: { score: number; status: string }) => void;
}

const CreditBureauCheckStep: React.FC<CreditBureauCheckStepProps> = ({ onComplete }) => (
  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">Credit Bureau Check</h3>
    <p className="mb-4">We're checking your credit score with credit bureaus...</p>
    <div className="flex justify-center my-8">
      <Button
        onClick={() => onComplete({ score: 746, status: "good" })}
        className="w-full max-w-md"
      >
        Simulate Credit Check Completion
      </Button>
    </div>
  </div>
);

export default CreditBureauCheckStep;
