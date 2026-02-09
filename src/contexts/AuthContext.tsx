import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Types for our auth state
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  orgType: 'BROKER' | 'MGA' | 'INSURER' | 'FLEXRA_INTERNAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string | null;
}

export interface Membership {
  id: string;
  organisationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'READ_ONLY';
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  createdAt: string;
  updatedAt: string | null;
}

export interface AuthState {
  // Supabase auth state
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  // App-level state
  user: User | null;
  organisation: Organisation | null;
  membership: Membership | null;
  // Loading states
  isLoading: boolean;
  isCheckingMembership: boolean;
  // Status
  hasMembership: boolean;
  hasPendingInvitation: boolean;
  membershipError: string | null;
}

export interface AuthContextValue extends AuthState {
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  // Membership actions
  createOrganisation: (name: string, orgType?: string) => Promise<{ error: Error | null }>;
  redeemInvitation: (token: string) => Promise<{ error: Error | null }>;
  refreshMembership: () => Promise<void>;
  membershipError: string | null;
  // Role checks
  isOwner: boolean;
  isAdmin: boolean;
  canWrite: boolean;
  canManageMembers: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    supabaseUser: null,
    user: null,
    organisation: null,
    membership: null,
    isLoading: true,
    isCheckingMembership: false,
    hasMembership: false,
    hasPendingInvitation: false,
    membershipError: null,
  });

  // Helper to make authenticated API calls
  const authenticatedFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  // Check membership status after Supabase auth
  const checkMembership = useCallback(async () => {
    setState(prev => ({ ...prev, isCheckingMembership: true, membershipError: null }));

    try {
      const data = await authenticatedFetch('/api/auth/check-membership');

      if (data.has_membership) {
        // Fetch full user info
        const meData = await authenticatedFetch('/api/auth/me');
        setState(prev => ({
          ...prev,
          user: {
            id: meData.user.id,
            email: meData.user.email,
            name: meData.user.name,
            createdAt: meData.user.created_at,
            updatedAt: meData.user.updated_at,
          },
          organisation: {
            id: meData.organisation.id,
            name: meData.organisation.name,
            orgType: meData.organisation.org_type,
            status: meData.organisation.status,
            createdAt: meData.organisation.created_at,
            updatedAt: meData.organisation.updated_at,
          },
          membership: {
            id: meData.membership.id,
            organisationId: meData.membership.organisation_id,
            userId: meData.membership.user_id,
            role: meData.membership.role,
            status: meData.membership.status,
            createdAt: meData.membership.created_at,
            updatedAt: meData.membership.updated_at,
          },
          hasMembership: true,
          hasPendingInvitation: false,
          membershipError: null,
          isCheckingMembership: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          organisation: null,
          membership: null,
          hasMembership: false,
          hasPendingInvitation: data.has_pending_invitation,
          membershipError: null,
          isCheckingMembership: false,
        }));
      }
    } catch (error) {
      console.error('Failed to check membership:', error);
      setState(prev => ({
        ...prev,
        user: null,
        organisation: null,
        membership: null,
        hasMembership: false,
        hasPendingInvitation: false,
        membershipError: error instanceof Error ? error.message : 'Failed to connect to server',
        isCheckingMembership: false,
      }));
    }
  }, [authenticatedFetch]);

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        supabaseUser: session?.user ?? null,
        isLoading: false,
      }));

      if (session) {
        checkMembership();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          supabaseUser: session?.user ?? null,
        }));

        if (event === 'SIGNED_IN' && session) {
          checkMembership();
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({
            ...prev,
            user: null,
            organisation: null,
            membership: null,
            hasMembership: false,
            hasPendingInvitation: false,
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkMembership]);

  // Auth actions
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? new Error(error.message) : null };
  };

  // Membership actions
  const createOrganisation = async (name: string, orgType = 'BROKER') => {
    try {
      await authenticatedFetch('/api/auth/signup-with-org', {
        method: 'POST',
        body: JSON.stringify({ name, org_type: orgType }),
      });
      await checkMembership();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const redeemInvitation = async (token: string) => {
    try {
      await authenticatedFetch('/api/auth/redeem-invitation', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      await checkMembership();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshMembership = async () => {
    await checkMembership();
  };

  // Role checks
  const role = state.membership?.role;
  const isOwner = role === 'OWNER';
  const isAdmin = role === 'OWNER' || role === 'ADMIN';
  const canWrite = role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER';
  const canManageMembers = isAdmin;

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    createOrganisation,
    redeemInvitation,
    refreshMembership,
    isOwner,
    isAdmin,
    canWrite,
    canManageMembers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
