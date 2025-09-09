import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { mockAgreements } from '@/lib/demo/fixtures';
import { RepaymentPlanner } from '@/components/customer/RepaymentPlanner';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function AgreementDetails() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  
  const agreement = mockAgreements.find(a => a.id === id);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!agreement) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Agreement Not Found</h1>
          <p className="text-muted-foreground">The requested agreement could not be found.</p>
        </div>
      </div>
    );
  }

  const statusVariant = agreement.status === 'ARREARS' ? 'destructive' : 
                       agreement.status === 'COMPLETED' ? 'secondary' : 'default';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                {agreement.product}
              </h1>
              <Badge variant={statusVariant}>
                {agreement.status}
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Policy Reference: {agreement.policyRef}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Agreement Overview */}
        <Card className="bg-secondary/30 border-secondary/40 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Agreement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Insurer</div>
                <div className="font-medium">{agreement.insurer}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Broker</div>
                <div className="font-medium">{agreement.broker}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Monthly Amount</div>
                <div className="font-medium">£{agreement.monthlyAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Outstanding Balance</div>
                <div className="font-medium text-primary">£{agreement.outstanding.toFixed(2)}</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Next Due Date</div>
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(agreement.nextDueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Payments Progress</div>
                <div className="font-medium">
                  {agreement.remainingTerm.paid} of {agreement.remainingTerm.total} paid
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Payment</div>
                <div className="flex items-center gap-2">
                  {agreement.lastPayment.status === 'PAID' ? (
                    <Badge variant="outline" className="text-green-600">
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Missed
                    </Badge>
                  )}
                  <span className="text-sm">
                    {new Date(agreement.lastPayment.date).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="default" className="bg-primary hover:bg-primary-hover">
                Pay Early
              </Button>
              <Button variant="outline">
                Change Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Repayment Planner */}
        <RepaymentPlanner agreement={agreement} />

        {/* Payment Details */}
        <Card className="card-premium animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Current payment schedule and method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Payment Method</span>
                <Badge variant="outline">Direct Debit</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Day</span>
                <span>{new Date(agreement.nextDueDate).getDate()}{getDayOfMonthSuffix(new Date(agreement.nextDueDate).getDate())} of each month</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Status</span>
                <Badge variant={agreement.arrears ? "destructive" : "outline"}>
                  {agreement.arrears ? "In Arrears" : "Up to Date"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getDayOfMonthSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}