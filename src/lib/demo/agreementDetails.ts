export interface AgreementDocument {
  id: string;
  name: string;
  type: 'Agreement' | 'SECCI' | 'Credit Check' | 'Amendment';
  uploadDate: string;
  size: string;
  url: string; // Mock URL
}

export interface AgreementActivity {
  id: string;
  type: 'created' | 'sent' | 'signed' | 'payment' | 'default' | 'completed' | 'note';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export const mockAgreementDocuments: Record<string, AgreementDocument[]> = {
  'AGR-2024-001': [
    {
      id: 'doc-001',
      name: 'Financing Agreement.pdf',
      type: 'Agreement',
      uploadDate: '2024-01-15',
      size: '2.4 MB',
      url: '#'
    },
    {
      id: 'doc-002',
      name: 'SECCI Document.pdf',
      type: 'SECCI',
      uploadDate: '2024-01-15',
      size: '1.8 MB',
      url: '#'
    },
    {
      id: 'doc-003',
      name: 'Credit Check Report.pdf',
      type: 'Credit Check',
      uploadDate: '2024-01-14',
      size: '945 KB',
      url: '#'
    }
  ],
  'AGR-2024-002': [
    {
      id: 'doc-004',
      name: 'Home Insurance Agreement.pdf',
      type: 'Agreement',
      uploadDate: '2024-03-01',
      size: '2.1 MB',
      url: '#'
    },
    {
      id: 'doc-005',
      name: 'SECCI Document.pdf',
      type: 'SECCI',
      uploadDate: '2024-03-01',
      size: '1.7 MB',
      url: '#'
    }
  ]
};

export const mockAgreementActivity: Record<string, AgreementActivity[]> = {
  'AGR-2024-001': [
    {
      id: 'act-001',
      type: 'created',
      title: 'Agreement Created',
      description: 'Financing agreement created for Motor Insurance policy',
      timestamp: '2024-01-14T10:30:00Z',
      user: 'Sarah Smith (Broker)'
    },
    {
      id: 'act-002',
      type: 'sent',
      title: 'Agreement Sent to Client',
      description: 'Agreement documents sent to client via email',
      timestamp: '2024-01-14T14:15:00Z',
      user: 'System'
    },
    {
      id: 'act-003',
      type: 'signed',
      title: 'Agreement Signed',
      description: 'Client electronically signed the agreement',
      timestamp: '2024-01-15T09:45:00Z',
      user: 'Sarah Johnson (Client)'
    },
    {
      id: 'act-004',
      type: 'payment',
      title: 'First Payment Received',
      description: 'Monthly payment of £105.50 received successfully',
      timestamp: '2024-02-15T08:00:00Z',
      user: 'Payment System'
    },
    {
      id: 'act-005',
      type: 'payment',
      title: 'Payment Received',
      description: 'Monthly payment of £105.50 received successfully',
      timestamp: '2024-03-15T08:00:00Z',
      user: 'Payment System'
    }
  ],
  'AGR-2024-002': [
    {
      id: 'act-006',
      type: 'created',
      title: 'Agreement Created',
      description: 'Financing agreement created for Home Insurance policy',
      timestamp: '2024-02-28T16:20:00Z',
      user: 'Sarah Smith (Broker)'
    },
    {
      id: 'act-007',
      type: 'sent',
      title: 'Agreement Sent to Client',
      description: 'Agreement documents sent to client via email',
      timestamp: '2024-03-01T09:30:00Z',
      user: 'System'
    },
    {
      id: 'act-008',
      type: 'signed',
      title: 'Agreement Signed',
      description: 'Client electronically signed the agreement',
      timestamp: '2024-03-01T15:22:00Z',
      user: 'Sarah Johnson (Client)'
    }
  ]
};

export const getStatusTimeline = (status: string, startDate: string) => {
  const steps = [
    { key: 'draft', label: 'Draft', completed: true },
    { key: 'sent', label: 'Sent', completed: true },
    { key: 'signed', label: 'Signed', completed: !['PENDING', 'PROPOSED', 'DRAFT', 'Pending'].includes(status) },
    { key: 'active', label: 'Active', completed: ['ACTIVE', 'Active', 'COMPLETED', 'Completed', 'DEFAULTED', 'Defaulted'].includes(status) },
    { key: 'completed', label: ['DEFAULTED', 'Defaulted'].includes(status) ? 'Defaulted' : 'Completed', completed: ['COMPLETED', 'Completed', 'DEFAULTED', 'Defaulted'].includes(status) }
  ];

  return steps;
};