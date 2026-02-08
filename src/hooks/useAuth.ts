// Re-export useAuth from context for convenience
// This replaces the old mock auth with real Supabase auth
export { useAuth } from '@/contexts/AuthContext';
export type {
  User,
  Organisation,
  Membership,
  AuthState,
  AuthContextValue,
} from '@/contexts/AuthContext';
