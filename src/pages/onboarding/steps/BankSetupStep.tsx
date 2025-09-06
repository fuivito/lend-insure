import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Banknote, 
  CheckCircle, 
  Link as LinkIcon, 
  Shield,
  Building,
  Clock,
  AlertCircle 
} from 'lucide-react';

interface BankSetupStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

export function BankSetupStep({ data, onUpdate, onComplete, completed }: BankSetupStepProps) {
  const [connectionMethod, setConnectionMethod] = useState<'openbanking' | 'manual'>('openbanking');
  const [bankData, setBankData] = useState(data.bankSetup || {
    connected: false,
    bankName: '',
    accountNumber: '',
    sortCode: '',
    mandateSigned: false
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleOpenBankingConnect = async () => {
    setIsConnecting(true);
    
    // Mock Open Banking connection
    setTimeout(() => {
      const newBankData = {
        connected: true,
        bankName: 'Lloyds Bank',
        accountNumber: '****1234',
        sortCode: '30-00-00',
        mandateSigned: false
      };
      setBankData(newBankData);
      onUpdate({ bankSetup: newBankData });
      setIsConnecting(false);
    }, 2000);
  };

  const handleManualEntry = () => {
    if (bankData.accountNumber && bankData.sortCode) {
      const newBankData = {
        ...bankData,
        connected: true,
        bankName: 'Manual Entry Bank'
      };
      setBankData(newBankData);
      onUpdate({ bankSetup: newBankData });
    }
  };

  const handleSignMandate = () => {
    const newBankData = {
      ...bankData,
      mandateSigned: true
    };
    setBankData(newBankData);
    onUpdate({ bankSetup: newBankData });
    onComplete();
  };

  const handleAccountChange = (field: string, value: string) => {
    setBankData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Banknote className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Bank Account</h2>
        <p className="text-muted-foreground">
          Set up automatic payments for your premium finance plan
        </p>
      </div>

      {!bankData.connected ? (
        <Tabs value={connectionMethod} onValueChange={(value) => setConnectionMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openbanking">Open Banking (Recommended)</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="openbanking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Secure Bank Connection
                </CardTitle>
                <CardDescription>
                  Connect your bank account securely using Open Banking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">Bank-level security</p>
                      <p className="text-sm text-muted-foreground">
                        Your login details are never shared with us
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">Instant verification</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically verify your account details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">Quick setup</p>
                      <p className="text-sm text-muted-foreground">
                        Complete setup in under 2 minutes
                      </p>
                    </div>
                  </div>
                </div>

                {isConnecting ? (
                  <div className="border border-border rounded-lg p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="font-medium">Connecting to your bank...</p>
                    <p className="text-sm text-muted-foreground">Please complete authentication on your bank's website</p>
                  </div>
                ) : (
                  <Button className="w-full btn-hero" onClick={handleOpenBankingConnect}>
                    <Building className="mr-2 h-4 w-4" />
                    Connect with Open Banking
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Bank Details</CardTitle>
                <CardDescription>
                  Manually enter your bank account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="sort-code">Sort Code</Label>
                    <Input
                      id="sort-code"
                      placeholder="30-00-00"
                      value={bankData.sortCode || ''}
                      onChange={(e) => handleAccountChange('sortCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="12345678"
                      value={bankData.accountNumber || ''}
                      onChange={(e) => handleAccountChange('accountNumber', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="bg-warning-light p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-warning">Additional verification required</p>
                      <p className="text-sm text-warning/80">
                        Manual entries require additional verification steps that may delay your application
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleManualEntry}
                  disabled={!bankData.accountNumber || !bankData.sortCode}
                >
                  Verify Account Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {/* Bank Connection Status */}
          <Card className="border-success/20 bg-success-light">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-success" />
                <div>
                  <h3 className="font-semibold text-success">Bank account connected</h3>
                  <p className="text-sm text-success/80">
                    {bankData.bankName} - Account ending in {bankData.accountNumber.slice(-4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direct Debit Mandate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Direct Debit Mandate
              </CardTitle>
              <CardDescription>
                Authorize automatic monthly payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!bankData.mandateSigned ? (
                <div>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Direct Debit Guarantee</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• This Guarantee is offered by all banks and building societies that accept instructions to pay Direct Debits</p>
                      <p>• If there are any changes to the amount, date or frequency of your Direct Debit Premium Finance Ltd will notify you 10 working days in advance</p>
                      <p>• If you request Premium Finance Ltd to collect a payment, confirmation of the amount and date will be given to you at the time of the request</p>
                      <p>• If an error is made in the payment of your Direct Debit, by Premium Finance Ltd or your bank or building society, you are entitled to a full and immediate refund of the amount paid from your bank or building society</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-primary-light rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Monthly payment: £114.00</p>
                      <p className="text-sm text-muted-foreground">First payment: 15th February 2024</p>
                    </div>
                    <Badge variant="outline">10 payments</Badge>
                  </div>

                  <Button className="w-full btn-hero" onClick={handleSignMandate}>
                    Sign Direct Debit Mandate
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="bg-success-light p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-success">Direct Debit mandate signed</p>
                      <p className="text-sm text-success/80">
                        Your payments will be collected automatically each month
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
        <p className="mb-2">
          <strong>Security:</strong> Your bank account details are encrypted and stored securely.
          We are PCI DSS compliant and follow industry best practices.
        </p>
        <p>
          <strong>Direct Debit:</strong> You can cancel your Direct Debit at any time by contacting your bank.
          Please note that cancelling payments may affect your agreement.
        </p>
      </div>
    </div>
  );
}