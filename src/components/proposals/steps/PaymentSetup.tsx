import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Proposal } from '@/types/proposals';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface PaymentSetupProps {
  proposal: Proposal;
  onContinue?: () => void;
  onBack?: () => void;
}

export function PaymentSetup({ proposal, onContinue, onBack }: PaymentSetupProps) {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    iban: '',
    bankName: '',
    billingEmail: ''
  });
  const [hasAuthorized, setHasAuthorized] = useState(false);
  const [mandateActive, setMandateActive] = useState(false);
  const [isCreatingMandate, setIsCreatingMandate] = useState(false);

  // Calculate first collection date (next month)
  const firstCollectionDate = addMonths(new Date(), 1);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate bank name based on IBAN (simplified example)
    if (field === 'iban' && value.length >= 4) {
      const bankCode = value.substring(4, 8).toUpperCase();
      let bankName = '';
      
      // Simple bank code mapping (in real implementation, this would be a proper lookup)
      switch (bankCode) {
        case 'BARC':
        case 'BUKB':
          bankName = 'Barclays Bank PLC';
          break;
        case 'NWBK':
          bankName = 'NatWest Bank PLC';
          break;
        case 'HBUK':
          bankName = 'HSBC Bank PLC';
          break;
        case 'LOYD':
          bankName = 'Lloyds Bank PLC';
          break;
        case 'RBOS':
          bankName = 'Royal Bank of Scotland PLC';
          break;
        default:
          bankName = 'Bank name will appear here';
      }
      
      setFormData(prev => ({
        ...prev,
        bankName
      }));
    }
  };

  const handleCreateMandate = async () => {
    setIsCreatingMandate(true);
    
    // Simulate GoCardless integration
    setTimeout(() => {
      setMandateActive(true);
      setIsCreatingMandate(false);
    }, 2000);
  };

  const isFormValid = formData.accountHolderName.trim() && 
                     formData.iban.trim() && 
                     formData.billingEmail.trim() && 
                     hasAuthorized;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Payment Setup (Direct Debit)</h2>
        </div>

        {!mandateActive ? (
          <div className="space-y-6">
            {/* Account Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  placeholder="Enter account holder name"
                  disabled={isCreatingMandate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email *</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                  placeholder="Enter billing email"
                  disabled={isCreatingMandate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => {
                  // Format IBAN with spaces every 4 characters
                  const value = e.target.value.replace(/\s/g, '').toUpperCase();
                  const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
                  handleInputChange('iban', formattedValue);
                }}
                placeholder="GB29 NWBK 6016 1331 9268 19"
                maxLength={34}
                disabled={isCreatingMandate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                placeholder="Bank name will appear automatically"
                disabled
                className="bg-muted"
              />
            </div>

            {/* Collection Information */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>First collection on {format(firstCollectionDate, 'dd MMMM yyyy')}</strong> for Instalment #1
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Subsequent collections will be taken monthly on the same date.
              </p>
            </div>

            {/* Authorization Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="dd-authorization"
                checked={hasAuthorized}
                onCheckedChange={(checked) => setHasAuthorized(checked as boolean)}
                disabled={isCreatingMandate}
              />
              <label 
                htmlFor="dd-authorization" 
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                I authorise Lendinsure to collect payments by Direct Debit from my account according to the instalment schedule.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateMandate}
                disabled={!isFormValid || isCreatingMandate}
                className="flex items-center space-x-2"
                size="lg"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {isCreatingMandate ? 'Creating Mandate...' : 'Create Mandate'}
                </span>
              </Button>
              
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isCreatingMandate}
                className="flex items-center space-x-2"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="space-y-6">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Direct Debit Mandate Active
              </h3>
              <p className="text-muted-foreground mb-4">
                Your Direct Debit has been successfully set up with {formData.bankName}
              </p>
              <div className="bg-muted/50 p-4 rounded-lg max-w-md mx-auto">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Holder:</span>
                    <span className="font-medium">{formData.accountHolderName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBAN:</span>
                    <span className="font-medium">***{formData.iban.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Collection:</span>
                    <span className="font-medium">{format(firstCollectionDate, 'dd MMM yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={onContinue}
                size="lg"
                className="flex items-center space-x-2"
              >
                <span>Continue</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}