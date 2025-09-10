import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Proposal } from '@/types/proposals';
import { Building2, User, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface CreditIdentityProps {
  proposal: Proposal;
  onContinue?: () => void;
}

interface FormData {
  companyName: string;
  companyRegNo: string;
  vatNumber: string;
  registeredAddress: string;
  representative: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  consents: {
    creditCheck: boolean;
    authorised: boolean;
  };
}

export function CreditIdentity({ proposal, onContinue }: CreditIdentityProps) {
  const [formData, setFormData] = useState<FormData>({
    companyName: 'Acme Insurance Ltd',
    companyRegNo: '12345678',
    vatNumber: 'GB123456789',
    registeredAddress: '123 Business Park, London, EC1A 1BB',
    representative: {
      name: 'John Smith',
      role: 'Managing Director',
      email: 'j.smith@acmeinsurance.co.uk',
      phone: '+44 20 7000 0000'
    },
    consents: {
      creditCheck: false,
      authorised: false
    }
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateRepresentative = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      representative: {
        ...prev.representative,
        [field]: value
      }
    }));
  };

  const updateConsent = (field: 'creditCheck' | 'authorised', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      consents: {
        ...prev.consents,
        [field]: checked
      }
    }));
  };

  // Check if form is complete
  const isFormComplete = 
    formData.companyName &&
    formData.companyRegNo &&
    formData.registeredAddress &&
    formData.representative.name &&
    formData.representative.role &&
    formData.representative.email &&
    formData.representative.phone &&
    formData.consents.creditCheck &&
    formData.consents.authorised;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Credit & Identity (Business)</h2>
        </div>
        <p className="text-muted-foreground">
          We need to verify your business details and perform compliance checks to proceed with your financing application.
        </p>
      </Card>

      {/* Business Information */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">Business Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyRegNo">Company Registration Number *</Label>
            <Input
              id="companyRegNo"
              value={formData.companyRegNo}
              onChange={(e) => updateField('companyRegNo', e.target.value)}
              placeholder="e.g. 12345678"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number</Label>
            <Input
              id="vatNumber"
              value={formData.vatNumber}
              onChange={(e) => updateField('vatNumber', e.target.value)}
              placeholder="e.g. GB123456789"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="registeredAddress">Registered Address *</Label>
            <Input
              id="registeredAddress"
              value={formData.registeredAddress}
              onChange={(e) => updateField('registeredAddress', e.target.value)}
              placeholder="Enter full registered address"
              required
            />
          </div>
        </div>
      </Card>

      {/* Authorised Representative */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg text-foreground">Authorised Representative</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="repName">Full Name *</Label>
            <Input
              id="repName"
              value={formData.representative.name}
              onChange={(e) => updateRepresentative('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repRole">Job Title/Role *</Label>
            <Input
              id="repRole"
              value={formData.representative.role}
              onChange={(e) => updateRepresentative('role', e.target.value)}
              placeholder="e.g. Director, Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repEmail">Email Address *</Label>
            <Input
              id="repEmail"
              type="email"
              value={formData.representative.email}
              onChange={(e) => updateRepresentative('email', e.target.value)}
              placeholder="email@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repPhone">Phone Number *</Label>
            <Input
              id="repPhone"
              type="tel"
              value={formData.representative.phone}
              onChange={(e) => updateRepresentative('phone', e.target.value)}
              placeholder="+44 7000 000000"
              required
            />
          </div>
        </div>
      </Card>

      {/* Consents and Authorisation */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-4">Consents & Authorisation</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="creditConsent"
              checked={formData.consents.creditCheck}
              onCheckedChange={(checked) => updateConsent('creditCheck', checked as boolean)}
            />
            <div className="space-y-1">
              <Label 
                htmlFor="creditConsent" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I consent to a soft credit check and open banking assessment
              </Label>
              <p className="text-xs text-muted-foreground">
                This helps us verify your business's financial standing without affecting your credit score.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="authorisationConsent"
              checked={formData.consents.authorised}
              onCheckedChange={(checked) => updateConsent('authorised', checked as boolean)}
            />
            <div className="space-y-1">
              <Label 
                htmlFor="authorisationConsent" 
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I am authorised to enter into this agreement on behalf of the business
              </Label>
              <p className="text-xs text-muted-foreground">
                You confirm that you have the legal authority to bind the business to this financing agreement.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Optional Open Banking */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Optional: Enhanced Verification</h4>
          <Button 
            variant="outline" 
            className="w-full md:w-auto flex items-center space-x-2"
            disabled
          >
            <CreditCard className="h-4 w-4" />
            <span>Connect Bank Account (Open Banking)</span>
          </Button>
          <p className="text-xs text-muted-foreground">
            Connect your business bank account for instant verification and potentially better terms.
          </p>
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end pt-6">
        <Button 
          size="lg" 
          className="px-8 flex items-center space-x-2"
          onClick={onContinue}
          disabled={!isFormComplete}
        >
          {isFormComplete && <CheckCircle className="h-4 w-4" />}
          <span>Continue</span>
        </Button>
      </div>

      {!isFormComplete && (
        <p className="text-sm text-muted-foreground text-center">
          Please complete all required fields and consent checkboxes to continue.
        </p>
      )}
    </div>
  );
}