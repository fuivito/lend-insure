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
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
            <p className="text-muted-foreground">Review and manage your insurance proposals</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="grid gap-4">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onClick={handleProposalClick}
            />
          ))
        ) : (
          <Card className="p-12 text-center">
            <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No proposals found</h3>
            <p className="text-muted-foreground">
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