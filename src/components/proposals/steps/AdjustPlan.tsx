import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Proposal } from '@/types/proposals';
import { format, addMonths } from 'date-fns';

interface PaymentPlan {
  instalmentNumber: number;
  dueDate: string;
  amount: number;
}

interface AdjustPlanProps {
  proposal: Proposal;
  onContinue?: () => void;
}

export function AdjustPlan({ proposal, onContinue }: AdjustPlanProps) {
  const [planLength, setPlanLength] = useState(12);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan[]>([]);

  // Calculate financial details
  const premium = proposal.terms.totalPremiumFinanced;
  const lendinsureFee = Math.round(premium * 0.054);
  const brokerFee = Math.round(premium * 0.02);
  const totalRepayable = premium + lendinsureFee + brokerFee;

  // Initialize payment plan
  useEffect(() => {
    generateEvenPlan();
  }, [planLength, totalRepayable]);

  const generateEvenPlan = () => {
    const evenAmount = Math.round(totalRepayable / planLength);
    const remainder = totalRepayable - (evenAmount * (planLength - 1));
    
    const plan: PaymentPlan[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < planLength; i++) {
      plan.push({
        instalmentNumber: i + 1,
        dueDate: format(addMonths(startDate, i + 1), 'yyyy-MM-dd'),
        amount: i === planLength - 1 ? remainder : evenAmount
      });
    }
    
    setPaymentPlan(plan);
  };

  const updatePaymentAmount = (index: number, newAmount: number) => {
    // Ensure minimum amount
    if (newAmount < 50) return;

    const updatedPlan = [...paymentPlan];
    const oldAmount = updatedPlan[index].amount;
    updatedPlan[index].amount = newAmount;

    // Calculate difference and redistribute
    const difference = oldAmount - newAmount;
    const remainingIndices = updatedPlan
      .map((_, i) => i)
      .filter(i => i !== index);

    if (remainingIndices.length > 0) {
      const redistributeAmount = Math.round(difference / remainingIndices.length);
      let remainingDifference = difference;

      remainingIndices.forEach((i, idx) => {
        const amountToAdd = idx === remainingIndices.length - 1 
          ? remainingDifference 
          : redistributeAmount;
        
        updatedPlan[i].amount = Math.max(50, updatedPlan[i].amount + amountToAdd);
        remainingDifference -= amountToAdd;
      });
    }

    setPaymentPlan(updatedPlan);
  };

  const currentTotal = paymentPlan.reduce((sum, payment) => sum + payment.amount, 0);
  const isBalanced = Math.abs(currentTotal - totalRepayable) < 1;

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 text-foreground">Payment Plan Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Premium Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Premium</span>
                <span className="font-medium">£{premium.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Finance Costs</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lendinsure Fee (5.4%)</span>
                <span className="font-medium">£{lendinsureFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Broker Fee (2%)</span>
                <span className="font-medium">£{brokerFee.toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Cost of Finance</span>
                <span>£{(lendinsureFee + brokerFee).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Total Repayable</h4>
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                £{totalRepayable.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Premium + Finance Costs
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-foreground">Payment Schedule</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Plan Length:</span>
              <Select value={planLength.toString()} onValueChange={(value) => setPlanLength(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 3).map(months => (
                    <SelectItem key={months} value={months.toString()}>
                      {months}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">months</span>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-80">Adjust Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentPlan.map((payment, index) => (
                <TableRow key={payment.instalmentNumber}>
                  <TableCell className="font-medium">{payment.instalmentNumber}</TableCell>
                  <TableCell>{format(new Date(payment.dueDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="font-medium">£{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[payment.amount]}
                        onValueChange={([value]) => updatePaymentAmount(index, value)}
                        min={50}
                        max={Math.min(totalRepayable - (paymentPlan.length - 1) * 50, totalRepayable * 0.8)}
                        step={10}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => updatePaymentAmount(index, parseInt(e.target.value) || 50)}
                        min={50}
                        className="w-24"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Balance Status */}
        <div className="flex justify-between items-center mt-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">Current Total: </span>
            <span className={`font-medium ${isBalanced ? 'text-success' : 'text-destructive'}`}>
              £{currentTotal.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Required Total: </span>
            <span className="font-medium">£{totalRepayable.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={generateEvenPlan}>
            Reset to Even
          </Button>
          
          <Button 
            size="lg" 
            className="px-8" 
            onClick={onContinue}
            disabled={!isBalanced}
          >
            Save Plan
          </Button>
        </div>
      </Card>
    </div>
  );
}