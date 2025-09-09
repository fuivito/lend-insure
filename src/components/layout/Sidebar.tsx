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
  Briefcase,
  Building
} from 'lucide-react';

const customerNavItems = [
  { title: 'Dashboard', url: '/app/customer', icon: Home },
  { title: 'Payments', url: '/app/payments', icon: CreditCard },
  { title: 'Documents', url: '/app/documents', icon: FileText },
  { title: 'Support', url: '/app/support', icon: HelpCircle },
];

const brokerNavItems = [
  { title: 'Dashboard', url: '/app/broker', icon: Home },
  { title: 'Clients', url: '/app/broker/clients', icon: Users },
  { title: 'Deal Builder', url: '/app/broker/deals', icon: PieChart },
  { title: 'Pipeline', url: '/app/broker/pipeline', icon: Briefcase },
];

export function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();
  
  const navItems = role === 'customer' ? customerNavItems : brokerNavItems;

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-foreground">LendInsure</h1>
            <p className="text-xs text-muted-foreground">Premium Finance</p>
          </div>
        </div>
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
          const isActive = location.pathname === item.url;
          
          return (
            <NavLink
              key={item.title}
              to={item.url}
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
          Logged in as <span className="font-medium capitalize">{role}</span>
        </div>
      </div>
    </div>
  );
}