import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Proposal } from '@/types/proposals';
import { format } from 'date-fns';
import { Building2, Mail, Calendar, Shield, PoundSterling, Check, X } from 'lucide-react';

interface ReviewProposalProps {
  proposal: Proposal;
  onContinue?: () => void;
}

export function ReviewProposal({ proposal, onContinue }: ReviewProposalProps) {
  return (
    <div className="space-y-6">
      {/* Broker Information */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{proposal.brokerName}</h3>
            <div className="flex items-center space-x-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span>{proposal.brokerEmail}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{proposal.insuranceType}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Expires {format(new Date(proposal.expiryDate), 'dd MMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Proposal Terms */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 text-foreground">Proposal Terms</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Terms */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-3">Premium Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Premium Financed</span>
                  <span className="font-medium">£{proposal.terms.totalPremiumFinanced.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-foreground mb-3">Suggested Payment Plan</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of Instalments</span>
                  <span className="font-medium">{proposal.terms.suggestedPlan.instalments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Amount</span>
                  <span className="font-medium">£{proposal.terms.suggestedPlan.monthlyAmount.toLocaleString()}</span>
                </div>
                {proposal.terms.apr && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated APR</span>
                    <span className="font-medium">{proposal.terms.apr}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Fees & Totals */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-3">Fees Breakdown</h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Lendinsure Fee ({proposal.terms.fees.lendinsure.percentage}%)
                  </span>
                  <span className="font-medium">£{proposal.terms.fees.lendinsure.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Broker Fee ({proposal.terms.fees.broker.percentage}%)
                  </span>
                  <span className="font-medium">£{proposal.terms.fees.broker.amount.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total Cost of Finance</span>
                  <span>£{proposal.terms.totalCostOfFinance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-foreground mb-3">Final Amount</h4>
              <div className="bg-primary-light/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Repayable</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      £{proposal.terms.totalRepayable.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Premium + Finance Costs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end pt-6">
        <Button size="lg" className="px-8" onClick={onContinue}>
          Continue to Adjust Plan
        </Button>
      </div>
    </div>
  );
}