import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, CheckCircle, FileText, HelpCircle, ExternalLink, Download } from 'lucide-react';
import { mockPayments, mockPlan } from '@/lib/fixtures';
import { PaymentHeroCard } from '@/components/dashboard/PaymentHeroCard';
import { PaymentProgressCard } from '@/components/dashboard/PaymentProgressCard';
import { ArrearsBanner } from '@/components/dashboard/ArrearsBanner';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
export default function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInArrears, setIsInArrears] = useState(false); // This would come from API/context
  
  const nextPayment = mockPayments.find(p => p.status === 'pending');
  const paidPayments = mockPayments.filter(p => p.status === 'paid').length;
  const totalPayments = mockPayments.length;
  const progressPercentage = paidPayments / totalPayments * 100;
  const remainingBalance = mockPlan.totalAmount - paidPayments * mockPlan.monthlyAmount;

  const getDaysUntilPayment = () => {
    if (!nextPayment) return 0;
    const today = new Date();
    const paymentDate = new Date(nextPayment.dueDate);
    const diffTime = paymentDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntil = getDaysUntilPayment();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Welcome back, John
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your premium finance plan
        </p>
      </div>

      <div className="grid gap-6">
        {/* Arrears Banner */}
        <ArrearsBanner isInArrears={isInArrears} />

        {/* Hero Section - Next Payment */}
        {nextPayment && (
          <PaymentHeroCard nextPayment={nextPayment} daysUntil={daysUntil} />
        )}

        {/* Status & Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Progress */}
          <PaymentProgressCard />

          {/* Account Status */}
          <Card className="card-premium animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Payment Status</span>
                <Badge className={isInArrears ? "status-error" : "status-success"}>
                  {isInArrears ? "In Arrears" : "In Good Standing"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Direct Debit</span>
                <Badge variant="outline" className="status-success">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Next Review</span>
                <span className="text-sm">June 2024</span>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Credit Provider: <strong>Premium Finance Ltd</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        <Card className="card-premium animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Payments
                </CardTitle>
                <CardDescription>Next 3 scheduled payments</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover-scale">
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.filter(p => p.status === 'pending').slice(0, 3).map((payment, index) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 bg-accent rounded-lg hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">£{payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Strip */}
        <Card className="border-warning/20 bg-warning-light animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-warning" />
              <div className="flex-1">
                <h3 className="font-semibold text-warning mb-1">
                  Struggling to make payments?
                </h3>
                <p className="text-sm text-warning/90">
                  We're here to help. Contact us early if you're having difficulties - we have support options available.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10 hover-scale">
                  View Support Options
                </Button>
                <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10 hover-scale">
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-premium animate-fade-in hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access your agreements and payment history
              </p>
              <Button variant="outline" className="w-full">
                View All Documents
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-premium animate-fade-in hover-scale" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review past payments and statements
              </p>
              <Button variant="outline" className="w-full">
                View Payment History
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-premium animate-fade-in hover-scale" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get help with your account or payments
              </p>
              <Button variant="outline" className="w-full">
                Get Support
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}