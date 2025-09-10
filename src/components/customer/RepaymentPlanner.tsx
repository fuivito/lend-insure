import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Agreement } from '@/lib/demo/fixtures';
import { toast } from 'sonner';

interface PaymentInstalment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  isPast: boolean;
}

interface RepaymentPlannerProps {
  agreement: Agreement;
}

export function RepaymentPlanner({ agreement }: RepaymentPlannerProps) {
  // Generate initial payment schedule
  const generateSchedule = (): PaymentInstalment[] => {
    const schedule: PaymentInstalment[] = [];
    const startDate = new Date(agreement.nextDueDate);
    const totalPayments = agreement.remainingTerm.total;
    const paidPayments = agreement.remainingTerm.paid;
    
    // Add past payments
    for (let i = 0; i < paidPayments; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() - (paidPayments - i));
      
      schedule.push({
        id: `past-${i}`,
        number: i + 1,
        dueDate: date.toISOString().split('T')[0],
        amount: agreement.monthlyAmount,
        isPast: true
      });
    }
    
    // Add future payments with even distribution
    const remainingPayments = totalPayments - paidPayments;
    const evenAmount = Math.floor(agreement.outstanding / remainingPayments);
    const remainder = agreement.outstanding - (evenAmount * remainingPayments);
    
    for (let i = 0; i < remainingPayments; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      schedule.push({
        id: `future-${i}`,
        number: paidPayments + i + 1,
        dueDate: date.toISOString().split('T')[0],
        amount: i === remainingPayments - 1 ? evenAmount + remainder : evenAmount,
        isPast: false
      });
    }
    
    return schedule;
  };

  const [schedule, setSchedule] = useState<PaymentInstalment[]>(generateSchedule());

  // Calculate totals and validation
  const futurePayments = schedule.filter(p => !p.isPast);
  const totalScheduled = futurePayments.reduce((sum, p) => sum + p.amount, 0);
  const isBalanced = Math.abs(totalScheduled - agreement.outstanding) < 0.01;

  // Update payment amount and rebalance
  const updatePayment = (id: string, newAmount: number) => {
    const amount = Math.max(0, Math.round(newAmount));
    
    setSchedule(prev => {
      const updated = [...prev];
      const targetIndex = updated.findIndex(p => p.id === id);
      
      if (targetIndex === -1 || updated[targetIndex].isPast) return prev;
      
      const oldAmount = updated[targetIndex].amount;
      const difference = amount - oldAmount;
      
      // Update target payment
      updated[targetIndex].amount = amount;
      
      // Find other future payments to rebalance
      const otherFuturePayments = updated.filter(p => !p.isPast && p.id !== id);
      
      if (otherFuturePayments.length === 0) return updated;
      
      // Distribute the difference across other payments
      const perPayment = Math.floor(Math.abs(difference) / otherFuturePayments.length);
      let remainingDiff = Math.abs(difference) - (perPayment * otherFuturePayments.length);
      
      otherFuturePayments.forEach((payment, index) => {
        const paymentIndex = updated.findIndex(p => p.id === payment.id);
        if (paymentIndex === -1) return;
        
        let adjustment = perPayment;
        if (index < remainingDiff) adjustment += 1;
        
        if (difference > 0) {
          // Target increased, decrease others
          updated[paymentIndex].amount = Math.max(0, payment.amount - adjustment);
        } else {
          // Target decreased, increase others
          updated[paymentIndex].amount = payment.amount + adjustment;
        }
      });
      
      // Final balance correction - put any remaining difference in the last payment
      const newTotal = updated.filter(p => !p.isPast).reduce((sum, p) => sum + p.amount, 0);
      const finalDiff = agreement.outstanding - newTotal;
      
      if (Math.abs(finalDiff) > 0) {
        const lastFutureIndex = updated.map((p, i) => ({ ...p, index: i }))
          .filter(p => !p.isPast)
          .pop()?.index;
          
        if (lastFutureIndex !== undefined) {
          updated[lastFutureIndex].amount = Math.max(0, updated[lastFutureIndex].amount + finalDiff);
        }
      }
      
      return updated;
    });
  };

  // Reset to even distribution
  const resetToEven = () => {
    setSchedule(generateSchedule());
    toast.info('Payment schedule reset to even distribution');
  };

  // Save plan
  const savePlan = () => {
    if (!isBalanced) {
      toast.error('Payment schedule must equal outstanding balance');
      return;
    }
    toast.success('Repayment plan saved successfully');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Repayment Planner
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust your payment schedule. Past payments cannot be changed.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetToEven}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Even
            </Button>
            <Button 
              onClick={savePlan}
              disabled={!isBalanced}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Balance Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <p className="text-lg font-semibold">£{agreement.outstanding.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Scheduled</p>
              <p className={`text-lg font-semibold ${isBalanced ? 'text-green-600' : 'text-destructive'}`}>
                £{totalScheduled.toFixed(2)}
              </p>
            </div>
          </div>
          {!isBalanced && (
            <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Total scheduled payments must equal outstanding balance
            </div>
          )}
        </div>

        {/* Payment Schedule Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((payment) => (
                <TableRow 
                  key={payment.id}
                  className={payment.isPast ? 'bg-muted/30 opacity-60' : undefined}
                >
                  <TableCell className="font-medium">
                    {payment.number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={payment.isPast ? 'text-muted-foreground' : ''}>
                        {new Date(payment.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <Badge 
                        variant={payment.isPast ? 'secondary' : 'outline'}
                        className="text-xs mt-1"
                      >
                        {payment.isPast ? 'Paid' : 'Due'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {payment.isPast ? (
                        <div className="text-right">
                          <p className="font-medium text-muted-foreground">
                            £{payment.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Locked</p>
                        </div>
                      ) : (
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">£</span>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={payment.amount}
                              onChange={(e) => updatePayment(payment.id, Number(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </div>
                          <Slider
                            value={[payment.amount]}
                            onValueChange={(value) => updatePayment(payment.id, value[0])}
                            max={agreement.outstanding}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}