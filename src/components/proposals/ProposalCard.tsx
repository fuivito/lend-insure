import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Proposal } from '@/types/proposals';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Building2, Calendar, PoundSterling } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  onClick: (proposal: Proposal) => void;
}

const statusConfig = {
  new: { color: 'bg-primary text-primary-foreground', label: 'New' },
  viewed: { color: 'bg-muted text-muted-foreground', label: 'Viewed' },
  accepted: { color: 'bg-success text-success-foreground', label: 'Accepted' },
  declined: { color: 'bg-destructive text-destructive-foreground', label: 'Declined' },
  expired: { color: 'bg-muted text-muted-foreground', label: 'Expired' }
};

export function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  const statusInfo = statusConfig[proposal.status];
  const isExpired = new Date(proposal.expiryDate) < new Date();
  
  return (
    <Card 
      className={cn(
        "p-6 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4",
        proposal.status === 'new' ? 'border-l-primary' : 'border-l-border'
      )}
      onClick={() => onClick(proposal)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{proposal.brokerName}</h3>
            <p className="text-sm text-muted-foreground">{proposal.insuranceType}</p>
          </div>
        </div>
        <Badge className={cn("text-xs font-medium", statusInfo.color)}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <PoundSterling className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Total Premium</p>
            <p className="font-semibold">£{proposal.totalPremium.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Expires</p>
            <p className={cn(
              "font-semibold text-sm",
              isExpired && "text-destructive"
            )}>
              {format(new Date(proposal.expiryDate), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}