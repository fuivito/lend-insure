import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Proposal } from '@/types/proposals';
import { CheckCircle, FileText, PenTool } from 'lucide-react';
import { format } from 'date-fns';

interface DigitalAgreementProps {
  proposal: Proposal;
  onContinue?: () => void;
}

export function DigitalAgreement({ proposal, onContinue }: DigitalAgreementProps) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);

  const premium = proposal.totalPremium;
  const lendinsureFee = proposal.terms.fees.lendinsure.amount;
  const brokerFee = proposal.terms.fees.broker.amount;
  const totalCostOfFinance = proposal.terms.totalCostOfFinance;
  const totalRepayable = proposal.terms.totalRepayable;

  const handleSign = async () => {
    setIsSigningInProgress(true);
    
    // Simulate DocuSign integration
    setTimeout(() => {
      setIsSigned(true);
      setIsSigningInProgress(false);
    }, 2000);
  };

  const agreementText = `
CREDIT AGREEMENT

This Credit Agreement ("Agreement") is entered into between Lendinsure Limited ("Lender") and the Customer ("Borrower") for the financing of insurance premiums.

1. CREDIT FACILITY
The Lender agrees to provide credit facilities to the Borrower for the purpose of financing insurance premiums as detailed in the Financing Summary.

2. REPAYMENT TERMS
The Borrower agrees to repay the total amount financed plus applicable fees and charges according to the instalment schedule detailed in this Agreement.

3. INTEREST RATES AND CHARGES
The annual percentage rate (APR) applicable to this Agreement is ${proposal.terms.apr}%. This includes all applicable fees and charges as detailed in the Financing Summary.

4. DIRECT DEBIT MANDATE
The Borrower authorizes the Lender to collect payments by Direct Debit from the nominated bank account on the due dates specified in the instalment schedule.

5. DEFAULT AND CONSEQUENCES
If the Borrower fails to make any payment when due, the entire outstanding balance may become immediately payable at the Lender's discretion.

6. RIGHT OF WITHDRAWAL
The Borrower has the right to withdraw from this Agreement within 14 days of signing without giving any reason.

7. DATA PROTECTION
The Lender will process personal data in accordance with applicable data protection laws and the Lender's Privacy Policy.

8. GOVERNING LAW
This Agreement is governed by and construed in accordance with the laws of England and Wales.

By signing this Agreement, the Borrower acknowledges having read, understood, and agreed to be bound by all terms and conditions contained herein.
  `;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Digital Agreement</h2>
        </div>

        {/* Financing Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Financing Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Premium (Annual)</span>
                <span className="font-medium">£{premium.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lendinsure Fee (5.4%)</span>
                <span className="font-medium">£{lendinsureFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Broker Fee (2%)</span>
                <span className="font-medium">£{brokerFee.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost of Finance</span>
                <span className="font-medium">£{totalCostOfFinance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-foreground">Total Repayable</span>
                <span className="font-semibold text-foreground">£{totalRepayable.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Instalment Schedule */}
          <h4 className="font-medium text-foreground mb-3">Final Instalment Schedule</h4>
          <div className="max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {proposal.customSchedule ? (
                proposal.customSchedule.map((instalment) => (
                  <div key={instalment.instalmentNumber} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Instalment {instalment.instalmentNumber} - {format(new Date(instalment.dueDate), 'dd MMM yyyy')}
                    </span>
                    <span className="font-medium">£{instalment.amount.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                // Fallback to suggested plan if no custom schedule
                Array.from({ length: proposal.terms.suggestedPlan.instalments }, (_, i) => {
                  const dueDate = new Date();
                  dueDate.setMonth(dueDate.getMonth() + i + 1);
                  return (
                    <div key={i + 1} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Instalment {i + 1} - {format(dueDate, 'dd MMM yyyy')}
                      </span>
                      <span className="font-medium">£{proposal.terms.suggestedPlan.monthlyAmount.toLocaleString()}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Agreement Text */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Credit Agreement & Direct Debit Mandate</h3>
          <Card className="p-4">
            <ScrollArea className="h-64 w-full">
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {agreementText}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Consent Checkbox */}
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="agreement-consent"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={isSigned}
            />
            <label 
              htmlFor="agreement-consent" 
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I have read and accept the Credit Agreement and Direct Debit Mandate.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isSigned ? (
            <Button
              onClick={handleSign}
              disabled={!hasAccepted || isSigningInProgress}
              className="flex items-center space-x-2"
              size="lg"
            >
              <PenTool className="h-4 w-4" />
              <span>
                {isSigningInProgress ? 'Signing...' : 'Sign with DocuSign'}
              </span>
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Signed</span>
              </div>
              <Button
                onClick={onContinue}
                size="lg"
                className="flex items-center space-x-2"
              >
                <span>Continue</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}