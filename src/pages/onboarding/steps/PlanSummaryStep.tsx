import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  FileText, 
  CheckCircle, 
  Edit,
  Calendar,
  CreditCard,
  Calculator,
  AlertTriangle,
  Info
} from 'lucide-react';
import { mockPlan } from '@/lib/fixtures';

interface PlanSummaryStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

export function PlanSummaryStep({ data, onUpdate, onComplete, completed }: PlanSummaryStepProps) {
  const [plan] = useState(mockPlan);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onUpdate({ planConfirmed: true });
    onComplete();
  };

  const calculateTotalCost = () => {
    return plan.monthlyAmount * plan.installments;
  };

  const calculateInterest = () => {
    return calculateTotalCost() - plan.premiumAmount + (plan.deposit || 0);
  };

  const calculateAnnualCost = () => {
    // Annual cost would be premium minus any discount for paying upfront
    return plan.premiumAmount - (plan.deposit || 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Review Your Plan</h2>
        <p className="text-muted-foreground">
          Please review your premium finance plan details before proceeding
        </p>
      </div>

      {/* Plan Summary */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{plan.productName}</CardTitle>
              <CardDescription>Premium Finance Plan</CardDescription>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Modify Your Plan</SheetTitle>
                  <SheetDescription>
                    Adjust your payment schedule and terms
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <p className="text-muted-foreground">
                    Plan modification options would be available here in the full implementation.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Amounts */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-primary-light rounded-lg">
              <div className="text-sm text-muted-foreground">Premium Amount</div>
              <div className="text-2xl font-bold text-primary">£{plan.premiumAmount.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <div className="text-sm text-muted-foreground">Monthly Payment</div>
              <div className="text-2xl font-bold">£{plan.monthlyAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </h3>
            
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span>Number of instalments</span>
                <span className="font-medium">{plan.installments} payments</span>
              </div>
              <div className="flex justify-between">
                <span>First payment date</span>
                <span className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(plan.firstPaymentDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment method</span>
                <span className="font-medium">Direct Debit</span>
              </div>
              {plan.deposit && (
                <div className="flex justify-between">
                  <span>Deposit paid</span>
                  <span className="font-medium text-success">£{plan.deposit.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Breakdown
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Premium amount</span>
                <span>£{plan.premiumAmount.toLocaleString()}</span>
              </div>
              {plan.deposit && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Less: Deposit paid</span>
                  <span>-£{plan.deposit.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Interest charges</span>
                <span>£{calculateInterest().toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total amount payable</span>
                <span>£{calculateTotalCost().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* APR */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-semibold">Representative APR</div>
                  <div className="text-sm text-muted-foreground">
                    Annual Percentage Rate of charge
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        The APR shows the total cost of your credit as a yearly rate. 
                        It includes the interest rate and other charges, helping you 
                        compare different credit offers.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold">{plan.apr}%</div>
            </div>
          </div>

          {/* Annual vs Monthly Comparison */}
          <Card className="border-warning/20 bg-warning-light/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 bg-background rounded border">
                  <div className="text-sm text-muted-foreground">Pay Monthly (Current Plan)</div>
                  <div className="text-lg font-bold text-primary">£{calculateTotalCost().toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{plan.installments} payments of £{plan.monthlyAmount}</div>
                </div>
                <div className="p-3 bg-background rounded border">
                  <div className="text-sm text-muted-foreground">Pay Annually</div>
                  <div className="text-lg font-bold text-success">£{calculateAnnualCost().toLocaleString()}</div>
                  <div className="text-xs text-success">You'd save £{calculateInterest().toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Monthly payments usually cost more than paying annually due to interest charges
              </div>
            </CardContent>
          </Card>

          {/* Credit Provider */}
          <div className="p-4 bg-accent rounded-lg">
            <h4 className="font-semibold mb-2">Credit Provider</h4>
            <p className="text-sm">
              <strong>{plan.creditProvider}</strong><br />
              Authorised and regulated by the Financial Conduct Authority (FCA)<br />
              Registration number: 123456
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-warning/20 bg-warning-light">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning mb-2">Important Information</h3>
              <div className="text-sm text-warning/90 space-y-2">
                <p>
                  • <strong>Monthly payments usually cost more than paying annually upfront.</strong> 
                  The total amount payable (£{calculateTotalCost().toLocaleString()}) 
                  is £{calculateInterest().toLocaleString()} more than the premium amount.
                </p>
                <p>
                  • Your payments are due monthly by Direct Debit. Late payment fees may apply.
                </p>
                <p>
                  • You can settle early at any time. Early settlement may reduce the total amount payable.
                </p>
                <p>
                  • This credit is regulated by the Consumer Credit Act 1974.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Before proceeding, please review:
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a href="/legal/credit-agreement" className="text-primary hover:underline">
            Credit Agreement Terms
          </a>
          <a href="/legal/secci" className="text-primary hover:underline">
            Pre-contract Information (SECCI)
          </a>
          <a href="/legal/direct-debit" className="text-primary hover:underline">
            Direct Debit Terms
          </a>
        </div>
      </div>

      {/* Confirmation */}
      <div className="flex justify-end">
        <Button 
          onClick={handleConfirm}
          disabled={confirmed}
          className={confirmed ? 'btn-success' : 'btn-hero'}
        >
          {completed ? 'Plan Confirmed' : 'Confirm Plan Details'}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}