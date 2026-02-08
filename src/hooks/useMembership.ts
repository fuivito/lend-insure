import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface MembershipData {
  id: string;
  organisationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'READ_ONLY';
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  createdAt: string;
  updatedAt: string | null;
  userEmail: string | null;
  userName: string | null;
}

export interface InvitationData {
  id: string;
  organisationId: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'READ_ONLY';
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

// Helper to transform API response to camelCase
function transformMembership(data: any): MembershipData {
  return {
    id: data.id,
    organisationId: data.organisation_id,
    userId: data.user_id,
    role: data.role,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userEmail: data.user_email,
    userName: data.user_name,
  };
}

function transformInvitation(data: any): InvitationData {
  return {
    id: data.id,
    organisationId: data.organisation_id,
    email: data.email,
    role: data.role,
    expiresAt: data.expires_at,
    acceptedAt: data.accepted_at,
    createdAt: data.created_at,
  };
}

export function useMemberships() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  });

  // List all memberships
  const membershipsQuery = useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch memberships');
      const data = await response.json();
      return data.map(transformMembership);
    },
    enabled: !!session,
  });

  // List pending invitations
  const invitationsQuery = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships/invitations`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const data = await response.json();
      return data.map(transformInvitation);
    },
    enabled: !!session,
  });

  // Invite a new member
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to invite user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  // Update a membership
  const updateMutation = useMutation({
    mutationFn: async ({ id, role, status }: { id: string; role?: string; status?: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role, status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update membership');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
  });

  // Remove a member
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to remove member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
  });

  // Cancel an invitation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships/invitations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to cancel invitation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  // Transfer ownership
  const transferOwnershipMutation = useMutation({
    mutationFn: async (newOwnerUserId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/broker/memberships/transfer-ownership?new_owner_user_id=${newOwnerUserId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to transfer ownership');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
  });

  return {
    memberships: membershipsQuery.data ?? [],
    invitations: invitationsQuery.data ?? [],
    isLoading: membershipsQuery.isLoading || invitationsQuery.isLoading,
    error: membershipsQuery.error || invitationsQuery.error,
    inviteMember: inviteMutation.mutateAsync,
    updateMembership: updateMutation.mutateAsync,
    removeMember: removeMutation.mutateAsync,
    cancelInvitation: cancelInvitationMutation.mutateAsync,
    transferOwnership: transferOwnershipMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
