import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Save, Lock } from 'lucide-react';
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
  // Auto-balancing repayment planner component
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
  
  const { outstandingBalance } = useMemo(() => {
    return {
      outstandingBalance: agreement.outstanding
    };
  }, [agreement.outstanding]);

  // Helper functions for the rebalancing algorithm
  const roundPounds = (n: number) => Math.max(0, Math.round(n || 0));
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const sumUpcomingExcept = (arr: PaymentScheduleItem[], omit?: string) =>
    arr.filter(r => r.isEditable && r.id !== omit).reduce((a, r) => a + (r.amount || 0), 0);

  // Feasible maximum for a given editable row when only subsequent rows + remainder can adjust.
  const getFeasibleMaxForRow = (rows: PaymentScheduleItem[], rowId: string): number => {
    const upcoming = rows.filter(r => r.isEditable);
    const targetPos = upcoming.findIndex(r => r.id === rowId);
    if (targetPos === -1) return 0;
    const fixedBeforeSum = upcoming
      .slice(0, targetPos)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    const max = Math.max(0, round2(agreement.outstanding - fixedBeforeSum));
    return max;
  };

  const updatePaymentAmount = (paymentId: string, newAmount: number) => {
    setPaymentSchedule(prev => {
      const updated = [...prev];
      const targetIndex = updated.findIndex(p => p.id === paymentId && p.isEditable);
      
      if (targetIndex === -1) return prev;
      
      // Get upcoming payment indices and identify remainder row (last upcoming)
      const upcomingRows = updated.filter(r => r.isEditable);
      const remainderRow = upcomingRows[upcomingRows.length - 1];
      const isRemainderRow = paymentId === remainderRow.id;
      
      // Don't allow manual editing of the remainder row
      if (isRemainderRow) return prev;
      
      // A) Round to whole pounds, clamp >= 0 and within feasible max (based on earlier upcoming rows only)
      const upcoming = updated.filter(r => r.isEditable);
      const targetPos = upcoming.findIndex(r => r.id === paymentId);
      const earlierSum = upcoming.slice(0, targetPos).reduce((a, r) => a + (r.amount || 0), 0);
      const feasibleMaxForTarget = Math.max(0, round2(agreement.outstanding - earlierSum));
      const oldValue = updated[targetIndex].amount;
      let next = roundPounds(Math.min(newAmount, feasibleMaxForTarget));
      if (next < 0) next = 0;

      // If no change, only refresh the remainder row and exit
      if (next === oldValue) {
        const nonRemainderSumNoChange = sumUpcomingExcept(updated, remainderRow.id);
        const remainderNoChange = round2(agreement.outstanding - nonRemainderSumNoChange);
        const rIdxNoChange = updated.findIndex(r => r.id === remainderRow.id);
        if (rIdxNoChange !== -1) updated[rIdxNoChange].amount = Math.max(0, remainderNoChange);
        return updated;
      }

      // B) Apply to target row
      updated[targetIndex].amount = next;

      // C) Compute delta and redistribute evenly across subsequent rows (excluding remainder)
      const deltaChange = round2(next - oldValue); // positive => others must reduce
      const subsequentRows = updated
        .slice(targetIndex + 1)
        .filter(r => r.isEditable && r.id !== remainderRow.id);

      if (subsequentRows.length > 0 && deltaChange !== 0) {
        const prevTotalSubsequent = subsequentRows.reduce((a, r) => a + (r.amount || 0), 0);
        let desiredTotal = Math.max(0, roundPounds(prevTotalSubsequent - deltaChange));

        const count = subsequentRows.length;
        const base = Math.floor(desiredTotal / count);
        let leftover = desiredTotal - base * count; // 0..count-1

        // Set all to base then distribute leftover +1 to the first 'leftover' rows
        subsequentRows.forEach((row, idx) => {
          const v = base + (idx < leftover ? 1 : 0);
          row.amount = roundPounds(Math.max(0, v));
        });
      }

      // D) Set auto-remainder row to balance exactly (may include pennies)
      const nonRemainderSum = sumUpcomingExcept(updated, remainderRow.id);
      const remainderValue = round2(agreement.outstanding - nonRemainderSum);
      const remainderIndex = updated.findIndex(r => r.id === remainderRow.id);
      if (remainderIndex !== -1) {
        updated[remainderIndex].amount = Math.max(0, remainderValue);
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    toast.success('Repayment plan updated successfully!');
  };

  const handleReset = () => {
    setPaymentSchedule(prev => {
      const reset = generatePaymentSchedule();
      const upcomingRows = reset.filter(r => r.isEditable);
      
      if (upcomingRows.length > 0) {
        // Even distribution in whole pounds with remainder handling
        const baseAmount = Math.floor(agreement.outstanding / upcomingRows.length);
        const remainder = agreement.outstanding % upcomingRows.length;
        
        upcomingRows.forEach((row, index) => {
          if (index < upcomingRows.length - 1) {
            // Non-remainder rows get base + potential extra £1
            row.amount = baseAmount + (index < remainder ? 1 : 0);
          } else {
            // Final row gets exact remainder to balance
            const sumOthers = upcomingRows.slice(0, -1).reduce((sum, r) => sum + r.amount, 0);
            row.amount = round2(agreement.outstanding - sumOthers);
          }
        });
      }
      
      return reset;
    });
    toast.info('Repayment plan reset to original schedule.');
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
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Balance Summary */}
        <div className="mb-6 p-4 bg-accent rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Outstanding Balance</div>
            <div className="text-lg font-bold text-primary">
              £{outstandingBalance.toFixed(2)}
            </div>
          </div>
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
                      (() => {
                        const upcomingRows = paymentSchedule.filter(r => r.isEditable);
                        const remainderRow = upcomingRows[upcomingRows.length - 1];
                        const isRemainderRow = payment.id === remainderRow.id;
                        
                        return isRemainderRow ? (
                          // Auto-remainder row (disabled with "Auto" chip)
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              £{payment.amount.toFixed(2)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Auto
                            </Badge>
                          </div>
                        ) : (
                          // Editable row
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`amount-${payment.id}`} className="sr-only">
                              Payment Amount
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">£</span>
                              {(() => {
                                const feasibleMax = getFeasibleMaxForRow(paymentSchedule, payment.id);
                                return (
                                  <Input
                                    id={`amount-${payment.id}`}
                                    type="number"
                                    min="0"
                                    step="1"
                                    max={Math.round(feasibleMax)}
                                    value={payment.amount}
                                    onChange={(e) => updatePaymentAmount(payment.id, Number(e.target.value) || 0)}
                                    className="w-24 text-right"
                                  />
                                );
                              })()}
                            </div>
                            <div className="w-32">
                              {(() => {
                                const feasibleMax = getFeasibleMaxForRow(paymentSchedule, payment.id);
                                const percent = feasibleMax > 0 ? Math.round((payment.amount / feasibleMax) * 100) : 0;
                                const clampPercent = Math.max(0, Math.min(100, percent));
                                return (
                                  <Slider
                                    value={[clampPercent]}
                                    onValueChange={([p]) => {
                                      const bounded = Math.max(0, Math.min(100, p));
                                      const mappedAmount = roundPounds(Math.round((bounded / 100) * feasibleMax));
                                      updatePaymentAmount(payment.id, mappedAmount);
                                    }}
                                    max={100}
                                    min={0}
                                    step={1}
                                    className="w-full"
                                  />
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          £{payment.amount}
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