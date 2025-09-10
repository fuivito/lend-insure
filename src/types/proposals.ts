export interface Proposal {
  id: string;
  brokerId: string;
  brokerName: string;
  brokerEmail: string;
  insuranceType: string;
  totalPremium: number;
  currency: string;
  expiryDate: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  terms: ProposalTerms;
  customSchedule?: CustomInstalment[];
  documents?: ProposalDocument[];
}

export type ProposalStatus = 'new' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface ProposalTerms {
  totalPremiumFinanced: number;
  suggestedPlan: {
    instalments: number;
    monthlyAmount: number;
  };
  apr?: number;
  fees: ProposalFees;
  totalCostOfFinance: number;
  totalRepayable: number;
}

export interface ProposalFees {
  lendinsure: {
    percentage: number;
    amount: number;
  };
  broker: {
    percentage: number;
    amount: number;
  };
}

export interface CustomInstalment {
  instalmentNumber: number;
  dueDate: string;
  amount: number;
  runningBalance: number;
}

export interface ProposalDocument {
  id: string;
  type: 'agreement' | 'schedule' | 'confirmation';
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface ProposalWorkflowStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}