import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, CheckCircle } from 'lucide-react';
import { mockPayments, mockPlan } from '@/lib/fixtures';

export function PaymentProgressCard() {
  const paidPayments = mockPayments.filter(p => p.status === 'paid').length;
  const totalPayments = mockPayments.length;
  const progressPercentage = paidPayments / totalPayments * 100;
  const remainingBalance = mockPlan.totalAmount - paidPayments * mockPlan.monthlyAmount;
  const paidAmount = paidPayments * mockPlan.monthlyAmount;

  return (
    <Card className="card-premium animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Payment Progress
        </CardTitle>
        <CardDescription>
          {paidPayments} of {totalPayments} instalments completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-bold">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="progress-premium h-3" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-success animate-scale-in">
              £{paidAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Amount Paid</div>
            <div className="text-xs text-success font-medium mt-1">
              {paidPayments} payments
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              £{remainingBalance.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalPayments - paidPayments} payments left
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}