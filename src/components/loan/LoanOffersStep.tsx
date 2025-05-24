
import React from "react";
import LoanOffers from "./LoanOffers";

interface Offer {
  id: number;
  provider?: string;
  amount: string;
  interestRate: string;
  tenure: string;
  emi: string;
  processingFee?: number;
  description?: string;
}

interface LoanOffersStepProps {
  offers: Offer[];
  onSelectOffer: (offer: Offer) => void;
}

const LoanOffersStep: React.FC<LoanOffersStepProps> = ({ offers, onSelectOffer }) => {
  return (
    <LoanOffers
      offers={offers}
      onSelectOffer={onSelectOffer}
    />
  );
};
export default LoanOffersStep;
