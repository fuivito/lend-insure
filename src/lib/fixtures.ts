// Mock data fixtures for LendInsure

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface Plan {
  id: string;
  productName: string;
  premiumAmount: number;
  deposit?: number;
  installments: number;
  apr: number;
  totalAmount: number;
  monthlyAmount: number;
  firstPaymentDate: string;
  creditProvider: string;
}

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'missed';
  paymentDate?: string;
  method?: string;
  reference?: string;
  fees?: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'agreement' | 'secci' | 'schedule' | 'mandate' | 'kyc';
  url: string;
  uploadDate: string;
}

// Mock customer data
export const mockCustomer: Customer = {
  id: 'cust-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+44 7700 900123',
  address: {
    line1: '123 High Street',
    line2: 'Apartment 4B',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom'
  }
};

// Mock plan data
export const mockPlan: Plan = {
  id: 'plan-001',
  productName: 'Home Insurance Premium',
  premiumAmount: 1200,
  deposit: 200,
  installments: 10,
  apr: 15.9,
  totalAmount: 1340,
  monthlyAmount: 114,
  firstPaymentDate: '2024-02-15',
  creditProvider: 'Premium Finance Ltd'
};

// Mock payment schedule
export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    amount: 114,
    dueDate: '2024-01-15',
    status: 'paid',
    paymentDate: '2024-01-14',
    method: 'Direct Debit',
    reference: 'DD-001-240114'
  },
  {
    id: 'pay-002',
    amount: 114,
    dueDate: '2024-02-15',
    status: 'paid',
    paymentDate: '2024-02-15',
    method: 'Direct Debit',
    reference: 'DD-002-240215'
  },
  {
    id: 'pay-003',
    amount: 114,
    dueDate: '2024-03-15',
    status: 'pending',
    method: 'Direct Debit'
  },
  {
    id: 'pay-004',
    amount: 114,
    dueDate: '2024-04-15',
    status: 'pending',
    method: 'Direct Debit'
  },
  {
    id: 'pay-005',
    amount: 114,
    dueDate: '2024-05-15',
    status: 'pending',
    method: 'Direct Debit'
  }
];

// Mock documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Credit Agreement',
    type: 'agreement',
    url: '/documents/credit-agreement.pdf',
    uploadDate: '2024-01-10'
  },
  {
    id: 'doc-002',
    name: 'SECCI Information',
    type: 'secci',
    url: '/documents/secci-info.pdf',
    uploadDate: '2024-01-10'
  },
  {
    id: 'doc-003',
    name: 'Payment Schedule',
    type: 'schedule',
    url: '/documents/payment-schedule.pdf',
    uploadDate: '2024-01-10'
  },
  {
    id: 'doc-004',
    name: 'Direct Debit Mandate',
    type: 'mandate',
    url: '/documents/dd-mandate.pdf',
    uploadDate: '2024-01-10'
  }
];

// Onboarding state management
export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: {
    identity?: Partial<Customer>;
    creditCheck?: {
      consent: boolean;
      status: 'pending' | 'success' | 'failed';
    };
    bankSetup?: {
      connected: boolean;
      bankName?: string;
      accountNumber?: string;
      mandateSigned?: boolean;
    };
    signature?: {
      signed: boolean;
      timestamp?: string;
      ip?: string;
    };
  };
}

export const initialOnboardingState: OnboardingState = {
  currentStep: 1,
  completedSteps: [],
  data: {}
};