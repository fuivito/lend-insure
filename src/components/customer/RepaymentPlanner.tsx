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

  const updatePaymentAmount = (paymentId: string, newAmount: number) => {
    const roundedAmount = Math.max(0, Math.round(newAmount)); // Round to £1 steps, min 0
    
    setPaymentSchedule(prev => {
      const updated = [...prev];
      const targetIndex = updated.findIndex(p => p.id === paymentId && p.isEditable);
      
      if (targetIndex === -1) return prev;
      
      // Set the target payment amount
      updated[targetIndex].amount = roundedAmount;
      
      // Get all editable payments after the current one
      const subsequentEditablePayments = updated.slice(targetIndex + 1).filter(p => p.isEditable);
      
      if (subsequentEditablePayments.length > 0) {
        // Calculate total already allocated (including paid amounts and current payment)
        const totalAllocated = updated.slice(0, targetIndex + 1).reduce((sum, p) => sum + p.amount, 0);
        
        // Calculate remaining balance to distribute
        const remainingBalance = agreement.outstanding - totalAllocated;
        
        // Distribute remaining balance evenly across subsequent payments
        const baseAmount = Math.floor(remainingBalance / subsequentEditablePayments.length);
        const remainder = remainingBalance % subsequentEditablePayments.length;
        
        subsequentEditablePayments.forEach((payment, index) => {
          const paymentIndex = updated.findIndex(p => p.id === payment.id);
          if (paymentIndex !== -1) {
            // First 'remainder' payments get an extra £1 to handle rounding
            const amount = baseAmount + (index < remainder ? 1 : 0);
            updated[paymentIndex].amount = Math.max(0, amount);
          }
        });
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    toast.success('Repayment plan updated successfully!');
  };

  const handleReset = () => {
    setPaymentSchedule(generatePaymentSchedule());
    toast.info('Repayment plan reset to original schedule.');
  };

  const distributeEvenly = () => {
    const editablePayments = paymentSchedule.filter(p => p.isEditable);
    if (editablePayments.length === 0) return;
    
    const baseAmount = Math.floor(agreement.outstanding / editablePayments.length);
    const remainder = agreement.outstanding % editablePayments.length;
    
    setPaymentSchedule(prev =>
      prev.map((payment, index) => {
        if (payment.isEditable) {
          const editableIndex = prev.slice(0, index).filter(p => p.isEditable).length;
          // First 'remainder' payments get an extra £1 to handle rounding
          const amount = baseAmount + (editableIndex < remainder ? 1 : 0);
          return { ...payment, amount };
        }
        return payment;
      })
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
                            step="1"
                            value={payment.amount}
                            onChange={(e) => updatePaymentAmount(payment.id, parseFloat(e.target.value) || 0)}
                            className="w-24 text-right"
                          />
                        </div>
                        <div className="w-32">
                          <Slider
                            value={[payment.amount]}
                            onValueChange={([value]) => updatePaymentAmount(payment.id, value)}
                            max={(() => {
                              // Calculate max possible amount for this payment
                              const currentPaymentIndex = paymentSchedule.findIndex(p => p.id === payment.id);
                              const paymentsAfter = paymentSchedule.slice(currentPaymentIndex + 1).filter(p => p.isEditable);
                              const totalPaidAndBefore = paymentSchedule
                                .slice(0, currentPaymentIndex)
                                .reduce((sum, p) => sum + p.amount, 0);
                              
                              // Max is outstanding minus what's already allocated minus minimum £0 for each subsequent payment
                              return Math.max(1, agreement.outstanding - totalPaidAndBefore);
                            })()}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
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