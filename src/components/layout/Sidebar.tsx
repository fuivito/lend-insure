import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Home,
  CreditCard,
  FileText,
  HelpCircle,
  Users,
  PieChart,
  ScrollText
} from 'lucide-react';

const customerNavItems = [
  { title: 'Dashboard', url: '/app/customer', icon: Home },
  { title: 'Proposals', url: '/app/proposals', icon: ScrollText },
  { title: 'Payments', url: '/app/payments', icon: CreditCard },
  { title: 'Documents', url: '/app/documents', icon: FileText },
  { title: 'Support', url: '/app/support', icon: HelpCircle },
];

const brokerNavItems = [
  { title: 'Dashboard', url: '/app/broker', icon: Home },
  { title: 'Deal Builder', url: '/app/broker/deal-builder', icon: PieChart },
  { title: 'Clients', url: '/app/broker/clients', icon: Users },
  { title: 'Agreements', url: '/app/broker/agreements', icon: FileText },
];

export function Sidebar() {
  const { membership } = useAuth();
  const location = useLocation();

  // Users with a membership are brokers (org members)
  // Customers use a separate portal with agreement access tokens
  const isBroker = !!membership;
  const navItems = isBroker ? brokerNavItems : customerNavItems;

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <img
          src="/flexra_full_logo.png"
          alt="Flexra"
          className="h-10 w-auto max-w-full"
        />
      </div>

      {/* Environment badge */}
      <div className="px-6 py-2">
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-light text-warning border border-warning/20">
          Demo Environment
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === '/app/broker' || item.url === '/app/customer' || item.url === '/app/broker/agreements'}
              className={({ isActive }) => cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Role indicator */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Logged in as <span className="font-medium capitalize">{membership?.role?.toLowerCase() || 'guest'}</span>
        </div>
      </div>
    </div>
  );
}