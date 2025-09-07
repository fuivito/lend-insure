// Mock data for customer agreements/financing plans

export interface Agreement {
  id: string;
  policyRef: string;
  product: string;
  insurer: string;
  broker: string;
  status: 'ACTIVE' | 'ARREARS' | 'COMPLETED';
  monthlyAmount: number;
  nextDueDate: string;
  remainingTerm: {
    paid: number;
    total: number;
  };
  outstanding: number;
  arrears: boolean;
  lastPayment: {
    status: 'PAID' | 'MISSED';
    date: string;
  };
}

export const mockAgreements: Agreement[] = [
  {
    id: "agr_001",
    policyRef: "MTR-34219",
    product: "Motor Insurance",
    insurer: "Demo Insurer plc",
    broker: "Demo Broker Ltd",
    status: "ACTIVE",
    monthlyAmount: 86.40,
    nextDueDate: "2025-10-15",
    remainingTerm: { paid: 3, total: 10 },
    outstanding: 692.80,
    arrears: false,
    lastPayment: { status: "PAID", date: "2025-09-15" }
  },
  {
    id: "agr_002",
    policyRef: "HME-11873",
    product: "Home Insurance",
    insurer: "Demo Insurer plc",
    broker: "Demo Broker Ltd",
    status: "ARREARS",
    monthlyAmount: 42.10,
    nextDueDate: "2025-09-20",
    remainingTerm: { paid: 5, total: 12 },
    outstanding: 294.70,
    arrears: true,
    lastPayment: { status: "MISSED", date: "2025-08-20" }
  },
  {
    id: "agr_003",
    policyRef: "TRV-98456",
    product: "Travel Insurance",
    insurer: "Global Cover Ltd",
    broker: "Travel Pro Brokers",
    status: "ACTIVE",
    monthlyAmount: 28.50,
    nextDueDate: "2025-11-01",
    remainingTerm: { paid: 2, total: 6 },
    outstanding: 114.00,
    arrears: false,
    lastPayment: { status: "PAID", date: "2025-09-01" }
  },
  {
    id: "agr_004",
    policyRef: "BIZ-22847",
    product: "Business Insurance",
    insurer: "Commercial Shield plc",
    broker: "Business First Ltd",
    status: "ACTIVE",
    monthlyAmount: 156.80,
    nextDueDate: "2025-10-25",
    remainingTerm: { paid: 7, total: 12 },
    outstanding: 784.00,
    arrears: false,
    lastPayment: { status: "PAID", date: "2025-09-25" }
  },
  {
    id: "agr_005",
    policyRef: "PET-67123",
    product: "Pet Insurance",
    insurer: "Animal Care Ltd",
    broker: "Pet Protection Co",
    status: "ARREARS",
    monthlyAmount: 34.90,
    nextDueDate: "2025-09-10",
    remainingTerm: { paid: 4, total: 8 },
    outstanding: 139.60,
    arrears: true,
    lastPayment: { status: "MISSED", date: "2025-08-10" }
  },
  {
    id: "agr_006",
    policyRef: "LIF-88901",
    product: "Life Insurance",
    insurer: "Life Secure plc",
    broker: "Family First Brokers",
    status: "ACTIVE",
    monthlyAmount: 67.25,
    nextDueDate: "2025-10-30",
    remainingTerm: { paid: 18, total: 24 },
    outstanding: 403.50,
    arrears: false,
    lastPayment: { status: "PAID", date: "2025-09-30" }
  }
];