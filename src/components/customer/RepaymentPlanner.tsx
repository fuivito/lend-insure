import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Save, RefreshCw, Lock } from 'lucide-react';
import { Agreement } from '@/lib/demo/fixtures';
import { toast } from 'sonner';

interface PaymentScheduleItem {
  id: string;
  date: string;
  amount: number;
  isPaid: boolean;
  isEditable: boolean;
}

interface RepaymentPlannerProps {
  agreement: Agreement;
}

export function RepaymentPlanner({ agreement }: RepaymentPlannerProps) {
  // Generate payment schedule based on agreement data
  const generatePaymentSchedule = (): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = [];
    const startDate = new Date(agreement.nextDueDate);
    const totalPayments = agreement.remainingTerm.total;
    const paidPayments = agreement.remainingTerm.paid;
    const remainingPayments = totalPayments - paidPayments;
    
    // Add past payments (greyed out/locked)
    for (let i = 0; i < paidPayments; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() - (paidPayments - i));
      
      schedule.push({
        id: `past-${i}`,
        date: date.toISOString().split('T')[0],
        amount: agreement.monthlyAmount,
        isPaid: true,
        isEditable: false
      });
    }
    
    // Add future payments (editable)
    for (let i = 0; i < remainingPayments; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      schedule.push({
        id: `future-${i}`,
        date: date.toISOString().split('T')[0],
        amount: agreement.monthlyAmount,
        isPaid: false,
        isEditable: true
      });
    }
    
    return schedule;
  };

  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>(generatePaymentSchedule());
  
  const { totalUpcoming, outstandingBalance, isBalanced } = useMemo(() => {
    const upcomingPayments = paymentSchedule.filter(p => p.isEditable);
    const total = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
    const balanced = Math.abs(total - agreement.outstanding) < 0.01; // Account for floating point precision
    
    return {
      totalUpcoming: total,
      outstandingBalance: agreement.outstanding,
      isBalanced: balanced
    };
  }, [paymentSchedule, agreement.outstanding]);

  const updatePaymentAmount = (paymentId: string, newAmount: number) => {
    if (newAmount < 0) return; // Prevent negative amounts
    
    setPaymentSchedule(prev => 
      prev.map(payment => 
        payment.id === paymentId && payment.isEditable
          ? { ...payment, amount: Math.max(0, newAmount) }
          : payment
      )
    );
  };

  const handleSave = () => {
    if (!isBalanced) {
      toast.error('Payment amounts must equal the outstanding balance to save.');
      return;
    }
    
    toast.success('Repayment plan updated successfully!');
  };

  const handleReset = () => {
    setPaymentSchedule(generatePaymentSchedule());
    toast.info('Repayment plan reset to original schedule.');
  };

  const distributeEvenly = () => {
    const editablePayments = paymentSchedule.filter(p => p.isEditable);
    if (editablePayments.length === 0) return;
    
    const evenAmount = agreement.outstanding / editablePayments.length;
    
    setPaymentSchedule(prev =>
      prev.map(payment =>
        payment.isEditable
          ? { ...payment, amount: Math.round(evenAmount * 100) / 100 }
          : payment
      )
    );
    
    toast.success('Payments distributed evenly across remaining instalments.');
  };

  return (
    <Card className="card-premium animate-fade-in" style={{ animationDelay: '100ms' }}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Repayment Planner
            </CardTitle>
            <CardDescription>
              Adjust your upcoming payment amounts. Past payments are locked.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={distributeEvenly}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Distribute Evenly
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Balance Summary */}
        <div className="mb-6 p-4 bg-accent rounded-lg">
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Outstanding Balance</div>
              <div className="text-lg font-bold text-primary">
                £{outstandingBalance.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Planned Total</div>
              <div className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-destructive'}`}>
                £{totalUpcoming.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difference</div>
              <div className={`text-lg font-bold ${isBalanced ? 'text-green-600' : 'text-destructive'}`}>
                £{(totalUpcoming - outstandingBalance).toFixed(2)}
              </div>
            </div>
          </div>
          
          {!isBalanced && (
            <div className="mt-3 text-center">
              <Badge variant="destructive" className="animate-pulse">
                Payment amounts must equal outstanding balance
              </Badge>
            </div>
          )}
        </div>

        {/* Payment Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Payment Schedule
          </h4>
          
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {paymentSchedule.map((payment, index) => (
              <div
                key={payment.id}
                className={`p-4 rounded-lg border transition-all ${
                  payment.isPaid 
                    ? 'bg-muted/50 opacity-60' 
                    : 'bg-background hover:bg-accent'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      payment.isPaid 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        {new Date(payment.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.isPaid ? 'Paid' : 'Upcoming'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {payment.isEditable ? (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`amount-${payment.id}`} className="sr-only">
                          Payment Amount
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">£</span>
                          <Input
                            id={`amount-${payment.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={payment.amount.toFixed(2)}
                            onChange={(e) => updatePaymentAmount(payment.id, parseFloat(e.target.value) || 0)}
                            className="w-24 text-right"
                          />
                        </div>
                        <div className="w-32">
                          <Slider
                            value={[payment.amount]}
                            onValueChange={([value]) => updatePaymentAmount(payment.id, value)}
                            max={agreement.outstanding}
                            min={0}
                            step={0.01}
                            className="w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          £{payment.amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={!isBalanced}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Repayment Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}