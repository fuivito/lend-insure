import { Proposal } from '@/types/proposals';

const API_BASE_URL = 'http://localhost:8000';

// Dev headers for testing
const getDevHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-Id': 'client-001',
  'X-Org-Id': '1',
  'X-Role': 'CUSTOMER',
  'X-Client-Id': '1' // Maps to the client created in seed
});

export async function fetchProposals(searchTerm?: string): Promise<Proposal[]> {
  const params = new URLSearchParams();
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  
  const url = `${API_BASE_URL}/api/customer/proposals${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: getDevHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch proposals');
  }
  
  const data = await response.json();
  
  // Transform snake_case to camelCase
  return data.map((proposal: any) => ({
    id: proposal.id,
    brokerId: proposal.broker_id,
    brokerName: proposal.broker_name,
    brokerEmail: proposal.broker_email,
    insuranceType: proposal.insurance_type,
    totalPremium: proposal.total_premium,
    currency: proposal.currency,
    expiryDate: proposal.expiry_date,
    status: proposal.status,
    createdAt: proposal.created_at,
    updatedAt: proposal.updated_at,
    terms: proposal.terms,
    customSchedule: proposal.custom_schedule
  }));
}

export async function fetchProposalById(id: string): Promise<Proposal> {
  const response = await fetch(`${API_BASE_URL}/api/customer/proposals/${id}`, {
    headers: getDevHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch proposal');
  }
  
  const proposal = await response.json();
  
  // Transform snake_case to camelCase
  return {
    id: proposal.id,
    brokerId: proposal.broker_id,
    brokerName: proposal.broker_name,
    brokerEmail: proposal.broker_email,
    insuranceType: proposal.insurance_type,
    totalPremium: proposal.total_premium,
    currency: proposal.currency,
    expiryDate: proposal.expiry_date,
    status: proposal.status,
    createdAt: proposal.created_at,
    updatedAt: proposal.updated_at,
    terms: proposal.terms,
    customSchedule: proposal.custom_schedule
  };
}

export async function acceptProposal(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/customer/proposals/${id}/accept`, {
    method: 'POST',
    headers: getDevHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to accept proposal');
  }
}

export async function declineProposal(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/customer/proposals/${id}/decline`, {
    method: 'POST',
    headers: getDevHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to decline proposal');
  }
}
