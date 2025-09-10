import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import { mockProposals } from '@/lib/demo/proposals';
import { Proposal } from '@/types/proposals';
import { ScrollText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ProposalsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProposals = mockProposals.filter(proposal => {
    const matchesSearch = proposal.brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.insuranceType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleProposalClick = (proposal: Proposal) => {
    navigate(`/app/proposals/${proposal.id}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6 sm:mb-8 animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Proposals</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Review and manage your insurance proposals</p>
          </div>
        </div>
        
        {/* Search - Full width on mobile */}
        <div className="relative w-full sm:w-auto sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4 animate-fade-in">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal, index) => (
            <div
              key={proposal.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProposalCard
                proposal={proposal}
                onClick={handleProposalClick}
              />
            </div>
          ))
        ) : (
          <Card className="p-8 sm:p-12 text-center animate-fade-in">
            <ScrollText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No proposals found</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'You don\'t have any proposals yet. New proposals from brokers will appear here.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}