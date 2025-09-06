import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';

interface BankSetupStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

const mockBanks = [
  { id: 'hsbc', name: 'HSBC', logo: '🏦' },
  { id: 'barclays', name: 'Barclays', logo: '🔵' },
  { id: 'lloyds', name: 'Lloyds', logo: '🐎' },
  { id: 'natwest', name: 'NatWest', logo: '💜' },
  { id: 'santander', name: 'Santander', logo: '🔴' },
  { id: 'nationwide', name: 'Nationwide', logo: '💙' },
];

export function BankSetupStep({ data, onUpdate, onComplete, completed }: BankSetupStepProps) {
  const [bankConnected, setBankConnected] = useState(data.bankSetup?.connected || false);
  const [mandateSigned, setMandateSigned] = useState(data.bankSetup?.mandateSigned || false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(data.bankSetup?.bankName || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [showMandateDialog, setShowMandateDialog] = useState(false);

  const connectBank = async (bankId: string) => {
    const bank = mockBanks.find(b => b.id === bankId);
    if (!bank) return;
    
    setSelectedBank(bank.name);
    setIsLoading(true);
    setShowBankSelector(false);
    
    // Mock bank connection
    setTimeout(() => {
      setBankConnected(true);
      setIsLoading(false);
      onUpdate({ bankSetup: { connected: true, mandateSigned, bankName: bank.name, accountNumber: '****1234' } });
    }, 2000);
  };

  const signMandate = () => {
    setMandateSigned(true);
    setShowMandateDialog(false);
    onUpdate({ bankSetup: { connected: bankConnected, mandateSigned: true, bankName: selectedBank, accountNumber: '****1234' } });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bank Account Setup</h2>
        <p className="text-muted-foreground">
          Connect your bank account to set up automatic payments for your premium finance plan
        </p>
      </div>

      {isLoading && (
        <Card className="border-warning/20 bg-warning-light">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-warning">Connecting to {selectedBank}...</h3>
                <p className="text-sm text-warning/80">
                  Please complete authentication on your bank's website. This usually takes 30-60 seconds.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!bankConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Connect Your Bank Account
            </CardTitle>
            <CardDescription>
              We use Open Banking to securely verify your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Secure Connection</p>
                  <p className="text-sm text-muted-foreground">
                    Your banking details are encrypted and we never store your login credentials.
                    The connection is read-only and managed by your bank.
                  </p>
                </div>
              </div>
            </div>
            
            <Dialog open={showBankSelector} onOpenChange={setShowBankSelector}>
              <DialogTrigger asChild>
                <Button className="w-full btn-hero">
                  <Building2 className="h-4 w-4 mr-2" />
                  Select Your Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Your Bank</DialogTitle>
                  <DialogDescription>
                    Choose your bank to connect via Open Banking
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  {mockBanks.map((bank) => (
                    <Button
                      key={bank.id}
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => connectBank(bank.id)}
                      disabled={isLoading}
                    >
                      <span className="text-2xl mr-3">{bank.logo}</span>
                      <span className="font-medium">{bank.name}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-success/20 bg-success-light">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <h3 className="font-semibold text-success">Bank Account Connected</h3>
                <p className="text-sm text-success/80">{selectedBank} - Current Account</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {showAccountDetails ? '12-34-56  87654321' : '••-••-••  ••••4321'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAccountDetails(!showAccountDetails)}
                  >
                    {showAccountDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Account Holder</span>
                <span className="text-sm font-medium">John Doe</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {bankConnected && (
        <>
          <Separator />
          
          {/* Direct Debit Mandate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Direct Debit Mandate
              </CardTitle>
              <CardDescription>
                Set up automatic monthly payments for your premium finance plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!mandateSigned ? (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Schedule</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly payment:</span>
                        <span className="font-medium">£114.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First payment:</span>
                        <span className="font-medium">15th February 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total payments:</span>
                        <span className="font-medium">10</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-warning-light rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-warning mb-1">Direct Debit Guarantee</p>
                        <p className="text-xs text-warning/80">
                          This guarantee is offered by all banks. If there are changes to payments, 
                          you'll be notified 10 working days in advance. Full refund available 
                          for any incorrect payments.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-success-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-success">Direct Debit mandate signed</p>
                      <p className="text-sm text-success/80">
                        Monthly payments of £114.00 will be collected automatically
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Dialog open={showMandateDialog} onOpenChange={setShowMandateDialog}>
              <DialogTrigger asChild>
                <Button 
                  disabled={!bankConnected || mandateSigned}
                  className={mandateSigned ? 'btn-success' : 'btn-hero'}
                >
                  {mandateSigned ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mandate Signed
                    </>
                  ) : (
                    <>
                      Sign Direct Debit Mandate
                      <CreditCard className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Direct Debit Mandate</DialogTitle>
                  <DialogDescription>
                    Please review and confirm your Direct Debit mandate
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Instruction to your bank or building society</h4>
                    <p className="text-sm text-muted-foreground">
                      Please pay Premium Finance Ltd Direct Debits from the account detailed in this Instruction 
                      subject to the safeguards assured by the Direct Debit Guarantee.
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Service user number</Label>
                      <p className="text-sm">123456</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reference</Label>
                      <p className="text-sm">PF-{Date.now().toString().slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowMandateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={signMandate} className="btn-hero">
                        Confirm & Sign Mandate
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
        <p className="mb-2">
          <strong>Security:</strong> Your bank account details are encrypted using bank-level security. 
          We are FCA regulated and follow strict data protection standards.
        </p>
        <p>
          <strong>Cancellation:</strong> You can cancel your Direct Debit at any time through your bank. 
          Please note this may affect your credit agreement.
        </p>
      </div>
    </div>
  );
}