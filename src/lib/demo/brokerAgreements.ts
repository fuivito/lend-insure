export interface BrokerAgreement {
  id: string;
  clientId: string;
  startDate: string;
  endDate: string;
  apr: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Defaulted';
  policyType: string;
  premium: number;
}

export const mockBrokerAgreements: BrokerAgreement[] = [
  {
    id: "AGR-2024-001",
    clientId: "client-001",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    apr: 8.5,
    status: "Active",
    policyType: "Motor Insurance",
    premium: 1200
  },
  {
    id: "AGR-2024-002",
    clientId: "client-001",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    apr: 7.8,
    status: "Active",
    policyType: "Home Insurance",
    premium: 850
  },
  {
    id: "AGR-2024-003",
    clientId: "client-001",
    startDate: "2023-06-10",
    endDate: "2024-06-10",
    apr: 9.2,
    status: "Completed",
    policyType: "Travel Insurance",
    premium: 450
  },
  {
    id: "AGR-2024-004",
    clientId: "client-002",
    startDate: "2024-02-20",
    endDate: "2025-02-20",
    apr: 6.9,
    status: "Active",
    policyType: "Home Insurance",
    premium: 1100
  },
  {
    id: "AGR-2024-005",
    clientId: "client-003",
    startDate: "2024-01-05",
    endDate: "2025-01-05",
    apr: 8.1,
    status: "Active",
    policyType: "Business Insurance",
    premium: 2200
  },
  {
    id: "AGR-2024-006",
    clientId: "client-003",
    startDate: "2024-04-15",
    endDate: "2025-04-15",
    apr: 7.5,
    status: "Pending",
    policyType: "Motor Insurance",
    premium: 950
  },
  {
    id: "AGR-2024-007",
    clientId: "client-004",
    startDate: "2024-03-10",
    endDate: "2025-03-10",
    apr: 9.0,
    status: "Active",
    policyType: "Pet Insurance",
    premium: 380
  },
  {
    id: "AGR-2024-008",
    clientId: "client-005",
    startDate: "2024-01-25",
    endDate: "2025-01-25",
    apr: 7.2,
    status: "Active",
    policyType: "Business Insurance",
    premium: 3200
  },
  {
    id: "AGR-2024-009",
    clientId: "client-005",
    startDate: "2024-02-10",
    endDate: "2025-02-10",
    apr: 8.8,
    status: "Active",
    policyType: "Professional Indemnity",
    premium: 1800
  },
  {
    id: "AGR-2024-010",
    clientId: "client-005",
    startDate: "2023-12-01",
    endDate: "2024-12-01",
    apr: 8.3,
    status: "Defaulted",
    policyType: "Motor Insurance",
    premium: 1050
  },
  {
    id: "AGR-2024-011",
    clientId: "client-005",
    startDate: "2024-05-01",
    endDate: "2025-05-01",
    apr: 7.9,
    status: "Pending",
    policyType: "Public Liability",
    premium: 950
  },
  {
    id: "AGR-2024-012",
    clientId: "client-006",
    startDate: "2024-03-20",
    endDate: "2025-03-20",
    apr: 8.4,
    status: "Active",
    policyType: "Property Insurance",
    premium: 1600
  },
  {
    id: "AGR-2024-013",
    clientId: "client-006",
    startDate: "2024-01-10",
    endDate: "2025-01-10",
    apr: 7.6,
    status: "Active",
    policyType: "Contents Insurance",
    premium: 750
  }
];