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
    brokerId: 'broker-001',
    brokerName: 'Sarah Smith Insurance',
    brokerEmail: 'sarah@smithinsurance.com',
    insuranceType: 'Directors & Officers',
    totalPremium: 15750,
    currency: 'GBP',
    expiryDate: '2025-01-22',
    status: 'new',
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
  }
];