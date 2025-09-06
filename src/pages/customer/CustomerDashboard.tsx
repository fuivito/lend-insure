import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, FileText, HelpCircle, ExternalLink, Download } from 'lucide-react';
import { mockPayments, mockPlan } from '@/lib/fixtures';
export default function CustomerDashboard() {
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
  return <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Welcome back, John
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your premium finance plan
        </p>
      </div>

      <div className="grid gap-6">
        {/* Hero Section - Next Payment */}
        {nextPayment && <Card className="card-hero">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0 mx-0">
                  <h2 className="font-heading text-2xl font-bold mb-2 text-slate-50">
                    Next Payment Due
                  </h2>
                  <div className="text-4xl font-bold mb-4 bg-gray-50 px-0 py-0 mx-[190px]">
                    £{nextPayment.amount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-4 text-primary-foreground/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{new Date(nextPayment.dueDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{daysUntil} days</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                    Pay Early
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white bg-transparent">
                    Change Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>}

        {/* Status & Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Progress */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Payment Progress
              </CardTitle>
              <CardDescription>
                {paidPayments} of {totalPayments} instalments paid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="progress-premium" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <div className="text-2xl font-bold text-success">
                    £{(paidPayments * mockPlan.monthlyAmount).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Paid</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    £{remainingBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Payment Status</span>
                <Badge className="status-success">In Good Standing</Badge>
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
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Payments
                </CardTitle>
                <CardDescription>Next 3 scheduled payments</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.filter(p => p.status === 'pending').slice(0, 3).map(payment => <div key={payment.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
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
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Help Strip */}
        <Card className="border-warning/20 bg-warning-light">
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
                <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10">
                  View Support Options
                </Button>
                <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10">
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-premium">
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

          <Card className="card-premium">
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

          <Card className="card-premium">
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
    </div>;
}