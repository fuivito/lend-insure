import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CalendarDays } from 'lucide-react';
import { mockPayments } from '@/lib/fixtures';

interface PaymentHeroCardProps {
  nextPayment: typeof mockPayments[0];
  daysUntil: number;
}

export function PaymentHeroCard({ nextPayment, daysUntil }: PaymentHeroCardProps) {
  // Get next 3 payment dates for mini calendar
  const upcomingDates = mockPayments
    .filter(p => p.status === 'pending')
    .slice(0, 3)
    .map(p => new Date(p.dueDate));

  return (
    <Card className="card-hero animate-fade-in">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-2xl font-bold mb-4 text-primary-foreground">
              Next Payment Due
            </h2>
            <div className="text-5xl font-bold mb-6 text-primary-foreground animate-scale-in">
              £{nextPayment.amount.toLocaleString()}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-primary-foreground/90 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">
                  {new Date(nextPayment.dueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{daysUntil} days</span>
              </div>
            </div>
            
            {/* Mini Calendar Strip */}
            <div className="bg-primary-foreground/10 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Upcoming Payments</span>
              </div>
              <div className="flex gap-3 justify-center lg:justify-start">
                {upcomingDates.map((date, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-primary-foreground/70 mb-1">
                      {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                    <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center text-sm font-medium text-primary-foreground">
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3 text-primary-foreground hover:bg-primary-foreground/20">
                View Full Schedule
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <Button variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/30">
              Pay Early
            </Button>
            <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
              Change Payment Method
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}