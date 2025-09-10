import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProposalTerms } from '@/types/proposals';
import { PoundSterling, Calendar, Percent } from 'lucide-react';

interface ProposalSummaryProps {
  terms: ProposalTerms;
  customSchedule?: boolean;
  instalments?: number;
}

export function ProposalSummary({ terms, customSchedule = false, instalments }: ProposalSummaryProps) {
  const displayInstalments = instalments || terms.suggestedPlan.instalments;
  const displayAmount = instalments ? terms.totalRepayable / instalments : terms.suggestedPlan.monthlyAmount;

  return (
    <div className="sticky top-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PoundSterling className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Proposal Summary</h3>
        </div>

        <div className="space-y-4">
          {/* Plan Details */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <div className="text-right">
              <span className="font-medium">
                {displayInstalments} instalments
              </span>
              {customSchedule && (
                <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>
              )}
            </div>
          </div>

          {!customSchedule && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Amount</span>
              <span className="font-medium">£{displayAmount.toLocaleString()}</span>
            </div>
          )}

          <Separator />

          {/* Financial Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Premium</span>
              <span className="font-medium">£{terms.totalPremiumFinanced.toLocaleString()}</span>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Lendinsure Fee ({terms.fees.lendinsure.percentage}%)
                </span>
                <span className="font-medium">£{terms.fees.lendinsure.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Broker Fee ({terms.fees.broker.percentage}%)
                </span>
                <span className="font-medium">£{terms.fees.broker.amount.toLocaleString()}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Total Cost of Finance</span>
                <span>£{terms.totalCostOfFinance.toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total Repayable</span>
              <span className="text-primary">£{terms.totalRepayable.toLocaleString()}</span>
            </div>

            {terms.apr && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1">
                  <Percent className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Estimated APR</span>
                </div>
                <span className="text-sm font-medium">{terms.apr}%</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}