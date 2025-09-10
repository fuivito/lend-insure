import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import { mockProposals } from '@/lib/demo/proposals';
import { Proposal, ProposalStatus } from '@/types/proposals';
import { ScrollText, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ProposalsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');

  const filteredProposals = mockProposals.filter(proposal => {
    const matchesSearch = proposal.brokerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.insuranceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockProposals.length,
    new: mockProposals.filter(p => p.status === 'new').length,
    viewed: mockProposals.filter(p => p.status === 'viewed').length,
    accepted: mockProposals.filter(p => p.status === 'accepted').length,
    declined: mockProposals.filter(p => p.status === 'declined').length,
    expired: mockProposals.filter(p => p.status === 'expired').length
  };

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

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProposalStatus | 'all')} className="mb-8">
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="all" className="relative">
            All
            {statusCounts.all > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-muted text-muted-foreground">
                {statusCounts.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="new" className="relative">
            New
            {statusCounts.new > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-primary text-primary-foreground">
                {statusCounts.new}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="viewed" className="relative">
            Viewed
            {statusCounts.viewed > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-muted text-muted-foreground">
                {statusCounts.viewed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="relative">
            Accepted
            {statusCounts.accepted > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-success text-success-foreground">
                {statusCounts.accepted}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="declined" className="relative">
            Declined
            {statusCounts.declined > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-destructive text-destructive-foreground">
                {statusCounts.declined}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="relative">
            Expired
            {statusCounts.expired > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-muted text-muted-foreground">
                {statusCounts.expired}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
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
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'You don\'t have any proposals yet. New proposals from brokers will appear here.'}
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}