import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, CheckCircle, Clock, AlertCircle, CreditCard, Info } from 'lucide-react';

interface CreditCheckStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

export function CreditCheckStep({ data, onUpdate, onComplete, completed }: CreditCheckStepProps) {
  const [consent, setConsent] = useState(data.creditCheck?.consent || false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>(
    data.creditCheck?.status || 'idle'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConsentChange = (checked: boolean) => {
    setConsent(checked);
    onUpdate({ creditCheck: { consent: checked, status } });
  };

  const runCreditCheck = async () => {
    if (!consent) return;

    setIsLoading(true);
    setStatus('pending');
    onUpdate({ creditCheck: { consent, status: 'pending' } });

    // Mock credit check with random result
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      const newStatus = success ? 'success' : 'failed';
      setStatus(newStatus);
      setIsLoading(false);
      onUpdate({ creditCheck: { consent, status: newStatus } });
      
      if (success) {
        onComplete();
      }
    }, 3000);
  };

  const renderStatusCard = () => {
    switch (status) {
      case 'pending':
        return (
          <Card className="border-warning/20 bg-warning-light">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-warning">Credit check in progress...</h3>
                  <p className="text-sm text-warning/80">
                    This usually takes 30-60 seconds. Please don't close this page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="border-success/20 bg-success-light">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-success" />
                <div>
                  <h3 className="font-semibold text-success">Credit check passed!</h3>
                  <p className="text-sm text-success/80">
                    You're eligible for premium finance. No impact on your credit score.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <Badge variant="outline" className="status-success">
                  Approved Amount: £1,200
                </Badge>
                <Badge variant="outline" className="status-success">
                  Rate: 15.9% APR
                </Badge>
              </div>
            </CardContent>
          </Card>
        );

      case 'failed':
        return (
          <Card className="border-destructive/20 bg-destructive-light">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Credit check unsuccessful</h3>
                  <p className="text-sm text-destructive/80">
                    Unfortunately, we can't approve your application at this time.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Credit Assessment</h2>
        <p className="text-muted-foreground">
          We'll perform a soft credit check to determine your eligibility. This won't affect your credit score.
        </p>
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            About Soft Credit Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">No impact on credit score</p>
                <p className="text-sm text-muted-foreground">
                  Soft searches don't appear on your credit file for other lenders to see
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Instant decision</p>
                <p className="text-sm text-muted-foreground">
                  Get approved in seconds with our automated assessment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Secure & confidential</p>
                <p className="text-sm text-muted-foreground">
                  Your data is protected with bank-level encryption
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Required</CardTitle>
          <CardDescription>
            Please confirm you understand and consent to the credit check
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="credit-consent"
              checked={consent}
              onCheckedChange={handleConsentChange}
            />
            <div className="space-y-1 leading-none flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor="credit-consent" className="text-sm font-medium cursor-pointer">
                  I consent to a soft credit check being performed *
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-success">Soft Check</p>
                          <p className="text-xs">• No impact on credit score</p>
                          <p className="text-xs">• Not visible to other lenders</p>
                          <p className="text-xs">• Used for eligibility assessment</p>
                        </div>
                        <div>
                          <p className="font-semibold text-destructive">Hard Check</p>
                          <p className="text-xs">• Can impact credit score</p>
                          <p className="text-xs">• Visible to other lenders</p>
                          <p className="text-xs">• We don't perform these</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                By checking this box, you agree to LendInsure and our credit provider{' '}
                <strong>Premium Finance Ltd</strong> performing a soft credit search to assess your eligibility.
                This search will not affect your credit score.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      {status !== 'idle' && renderStatusCard()}

      {/* Action */}
      <div className="flex justify-end">
        {status === 'idle' && (
          <Button 
            onClick={runCreditCheck}
            disabled={!consent || isLoading}
            className="btn-hero"
          >
            Run Credit Check
            <Shield className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {status === 'success' && (
          <Button className="btn-success" disabled>
            Credit Check Passed
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
        <p className="mb-2">
          <strong>Credit Provider:</strong> Premium Finance Ltd, authorised and regulated by the Financial Conduct Authority.
        </p>
        <p>
          By proceeding, you acknowledge that credit is subject to status and affordability checks.
          Monthly payments may cost more than paying annually upfront.
        </p>
      </div>
    </div>
  );
}