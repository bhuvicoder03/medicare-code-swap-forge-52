
import React from "react";
import { Button } from "@/components/ui/button";

interface KycVerificationStepProps {
  onComplete: (data: { status: string; method: string }) => void;
}

const KycVerificationStep: React.FC<KycVerificationStepProps> = ({ onComplete }) => (
  <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
    <h3 className="text-xl font-semibold mb-4">KYC Verification</h3>
    <p className="mb-4">We're verifying your identity through KYC process...</p>
    <div className="flex justify-center my-8">
      <Button
        onClick={() => onComplete({ status: "verified", method: "aadhaar" })}
        className="w-full max-w-md"
      >
        Simulate KYC Verification
      </Button>
    </div>
  </div>
);

export default KycVerificationStep;
