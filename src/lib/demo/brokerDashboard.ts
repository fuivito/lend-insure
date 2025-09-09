// Mock data for broker dashboard

export interface BrokerStats {
  activeAgreements: {
    count: number;
    totalFinanced: number;
  };
  defaults: {
    count: number;
    percentage: number;
  };
  terminatedAgreements: {
    count: number;
  };
  revenueYTD: number;
}

export interface BrokerNotification {
  id: string;
  type: 'agreement_signed' | 'payment_missed' | 'refund_raised' | 'policy_renewal' | 'client_inquiry';
  message: string;
  date: string;
  clientName?: string;
  policyRef?: string;
}

export const mockBrokerStats: BrokerStats = {
  activeAgreements: {
    count: 247,
    totalFinanced: 2847650.00
  },
  defaults: {
    count: 12,
    percentage: 4.9
  },
  terminatedAgreements: {
    count: 38
  },
  revenueYTD: 184750.00
};

export const mockBrokerNotifications: BrokerNotification[] = [
  {
    id: 'notif_001',
    type: 'agreement_signed',
    message: 'New agreement signed for Motor Insurance policy',
    date: '2025-01-09T10:30:00Z',
    clientName: 'Sarah Johnson',
    policyRef: 'MTR-45782'
  },
  {
    id: 'notif_002',
    type: 'payment_missed',
    message: 'Payment missed for Home Insurance policy',
    date: '2025-01-09T09:15:00Z',
    clientName: 'Michael Chen',
    policyRef: 'HME-22341'
  },
  {
    id: 'notif_003',
    type: 'refund_raised',
    message: 'Refund request raised for Travel Insurance',
    date: '2025-01-08T16:45:00Z',
    clientName: 'Emma Wilson',
    policyRef: 'TRV-98123'
  },
  {
    id: 'notif_004',
    type: 'policy_renewal',
    message: 'Policy renewal due for Business Insurance',
    date: '2025-01-08T14:20:00Z',
    clientName: 'TechStart Ltd',
    policyRef: 'BIZ-67890'
  },
  {
    id: 'notif_005',
    type: 'client_inquiry',
    message: 'New client inquiry for Pet Insurance',
    date: '2025-01-08T11:30:00Z',
    clientName: 'David Thompson'
  },
  {
    id: 'notif_006',
    type: 'agreement_signed',
    message: 'Life Insurance agreement completed',
    date: '2025-01-07T15:10:00Z',
    clientName: 'Lisa Rodriguez',
    policyRef: 'LIF-33456'
  },
  {
    id: 'notif_007',
    type: 'payment_missed',
    message: 'Second missed payment alert',
    date: '2025-01-07T08:30:00Z',
    clientName: 'Robert Kumar',
    policyRef: 'MTR-78901'
  },
  {
    id: 'notif_008',
    type: 'agreement_signed',
    message: 'Commercial property insurance finalized',
    date: '2025-01-06T13:45:00Z',
    clientName: 'Property Group UK',
    policyRef: 'COM-12345'
  }
];