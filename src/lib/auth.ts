// Mock authentication and role management for LendInsure
export type UserRole = 'customer' | 'broker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Mock user data
const mockUsers: Record<UserRole, User> = {
  customer: {
    id: 'cust-001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'customer'
  },
  broker: {
    id: 'broker-001',
    email: 'sarah.smith@lendinsure.com',
    name: 'Sarah Smith',
    role: 'broker'
  }
};

// Current user state (in real app, this would be managed by auth provider)
let currentUser: User | null = null;
let currentRole: UserRole = (localStorage.getItem('currentRole') as UserRole) || 'customer';

export const authService = {
  getCurrentUser: (): User | null => currentUser,
  getCurrentRole: (): UserRole => currentRole,
  
  setRole: (role: UserRole) => {
    currentRole = role;
    currentUser = mockUsers[role];
    localStorage.setItem('currentRole', role);
  },
  
  login: (role: UserRole = 'customer') => {
    currentRole = role;
    currentUser = mockUsers[role];
    return Promise.resolve(currentUser);
  },
  
  logout: () => {
    currentUser = null;
    currentRole = 'customer';
    return Promise.resolve();
  },
  
  isAuthenticated: (): boolean => currentUser !== null,
  
  hasRole: (role: UserRole): boolean => currentUser?.role === role,
  
  // Check if user has completed onboarding
  hasCompletedOnboarding: (): boolean => {
    if (currentRole === 'customer') {
      // Check localStorage for onboarding completion
      return localStorage.getItem('onboarding-completed') === 'true';
    }
    return true; // Brokers don't need onboarding for now
  },
  
  setOnboardingCompleted: () => {
    localStorage.setItem('onboarding-completed', 'true');
  }
};

// Initialize with the stored role (or customer by default)
authService.login(currentRole);