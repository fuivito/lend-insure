import { Proposal } from '@/types/proposals';

export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    brokerId: 'broker-001',
    brokerName: 'Sarah Smith Insurance',
    brokerEmail: 'sarah@smithinsurance.com',
    insuranceType: 'Commercial Property',
    totalPremium: 28500,
    currency: 'GBP',
    expiryDate: '2025-01-15',
    status: 'new',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    terms: {
      totalPremiumFinanced: 28500,
      suggestedPlan: {
        instalments: 12,
        monthlyAmount: 2653
      },
      apr: 8.4,
      fees: {
        lendinsure: {
          percentage: 5.4,
          amount: 1539
        },
        broker: {
          percentage: 2.0,
          amount: 570
        }
      },
      totalCostOfFinance: 2109,
      totalRepayable: 30609
    }
  },
  {
    id: 'prop-002',
    brokerId: 'broker-002',
    brokerName: 'Metropolitan Risk Solutions',
    brokerEmail: 'deals@metrorisk.com',
    insuranceType: 'Directors & Officers',
    totalPremium: 15750,
    currency: 'GBP',
    expiryDate: '2025-01-22',
    status: 'viewed',
    createdAt: '2024-11-28T14:30:00Z',
    updatedAt: '2024-12-03T09:15:00Z',
    terms: {
      totalPremiumFinanced: 15750,
      suggestedPlan: {
        instalments: 9,
        monthlyAmount: 1925
      },
      apr: 7.9,
      fees: {
        lendinsure: {
          percentage: 5.4,
          amount: 851
        },
        broker: {
          percentage: 2.0,
          amount: 315
        }
      },
      totalCostOfFinance: 1166,
      totalRepayable: 16916
    }
  },
  {
    id: 'prop-003',
    brokerId: 'broker-003',
    brokerName: 'Elite Commercial Brokers',
    brokerEmail: 'team@elitecommercial.co.uk',
    insuranceType: 'Fleet Insurance',
    totalPremium: 42000,
    currency: 'GBP',
    expiryDate: '2025-02-10',
    status: 'accepted',
    createdAt: '2024-11-15T11:20:00Z',
    updatedAt: '2024-11-20T16:45:00Z',
    terms: {
      totalPremiumFinanced: 42000,
      suggestedPlan: {
        instalments: 6,
        monthlyAmount: 7595
      },
      apr: 6.2,
      fees: {
        lendinsure: {
          percentage: 5.4,
          amount: 2268
        },
        broker: {
          percentage: 2.0,
          amount: 840
        }
      },
      totalCostOfFinance: 3108,
      totalRepayable: 45108
    }
  },
  {
    id: 'prop-004',
    brokerId: 'broker-001',
    brokerName: 'Sarah Smith Insurance',
    brokerEmail: 'sarah@smithinsurance.com',
    insuranceType: 'Public Liability',
    totalPremium: 8500,
    currency: 'GBP',
    expiryDate: '2024-12-20',
    status: 'expired',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z',
    terms: {
      totalPremiumFinanced: 8500,
      suggestedPlan: {
        instalments: 12,
        monthlyAmount: 789
      },
      apr: 8.1,
      fees: {
        lendinsure: {
          percentage: 5.4,
          amount: 459
        },
        broker: {
          percentage: 2.0,
          amount: 170
        }
      },
      totalCostOfFinance: 629,
      totalRepayable: 9129
    }
  },
  {
    id: 'prop-005',
    brokerId: 'broker-004',
    brokerName: 'Pinnacle Insurance Group',
    brokerEmail: 'underwriting@pinnacle.com',
    insuranceType: 'Cyber Liability',
    totalPremium: 19200,
    currency: 'GBP',
    expiryDate: '2025-01-30',
    status: 'declined',
    createdAt: '2024-11-25T13:45:00Z',
    updatedAt: '2024-11-30T10:30:00Z',
    terms: {
      totalPremiumFinanced: 19200,
      suggestedPlan: {
        instalments: 8,
        monthlyAmount: 2640
      },
      apr: 7.5,
      fees: {
        lendinsure: {
          percentage: 5.4,
          amount: 1037
        },
        broker: {
          percentage: 2.0,
          amount: 384
        }
      },
      totalCostOfFinance: 1421,
      totalRepayable: 20621
    }
  }
];