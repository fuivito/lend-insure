import { Card } from '@/components/ui/card';
import { Proposal } from '@/types/proposals';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Building2, Calendar, PoundSterling } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  onClick: (proposal: Proposal) => void;
}

export function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  const isExpired = new Date(proposal.expiryDate) < new Date();
  
  return (
    <Card 
      className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-primary hover-scale active:scale-[0.98]"
      onClick={() => onClick(proposal)}
    >
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{proposal.brokerName}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{proposal.insuranceType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex items-center space-x-2">
          <PoundSterling className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total Premium</p>
            <p className="font-semibold text-sm sm:text-base">£{proposal.totalPremium.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
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