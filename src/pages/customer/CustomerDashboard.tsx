import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, CheckCircle, FileText, HelpCircle, ExternalLink, Download, Plus } from 'lucide-react';
import { mockPayments, mockPlan } from '@/lib/fixtures';
import { PaymentHeroCard } from '@/components/dashboard/PaymentHeroCard';
import { PaymentProgressCard } from '@/components/dashboard/PaymentProgressCard';
import { ArrearsBanner } from '@/components/dashboard/ArrearsBanner';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
export default function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInArrears, setIsInArrears] = useState(false); // This would come from API/context
  const navigate = useNavigate();
  
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

  const handleStartFinancing = () => {
    // Reset onboarding state for new application
    localStorage.removeItem('onboarding-completed');
    localStorage.removeItem('onboarding-state');
    navigate('/app/onboarding');
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome back, John
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Here's an overview of your premium finance plan
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={handleStartFinancing} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Start Financing
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Arrears Banner */}
        <ArrearsBanner isInArrears={isInArrears} />

        {/* Hero Section - Next Payment */}
        {nextPayment && (
          <PaymentHeroCard nextPayment={nextPayment} daysUntil={daysUntil} />
        )}

        {/* Status & Progress */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Payments
                </CardTitle>
                <CardDescription>Next 3 scheduled payments</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover-scale w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                <span className="sm:inline">Add to Calendar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.filter(p => p.status === 'pending').slice(0, 3).map((payment, index) => (
                <div 
                  key={payment.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-accent rounded-lg hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">£{payment.amount.toLocaleString()}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(payment.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs self-start sm:self-auto">Scheduled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Strip */}
        <Card className="border-warning/20 bg-warning-light animate-fade-in">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-3 flex-1">
                <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1 text-sm sm:text-base">
                    Struggling to make payments?
                  </h3>
                  <p className="text-xs sm:text-sm text-warning/90">
                    We're here to help. Contact us early if you're having difficulties - we have support options available.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10 hover-scale w-full sm:w-auto text-xs sm:text-sm">
                  View Support Options
                </Button>
                <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10 hover-scale w-full sm:w-auto text-xs sm:text-sm">
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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