import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, User, Mail, Phone, MapPin, CheckCircle, X, Search } from 'lucide-react';
import type { Customer } from '@/lib/fixtures';

interface IdentityStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

export function IdentityStep({ data, onUpdate, onComplete, completed }: IdentityStepProps) {
  const [identity, setIdentity] = useState<Partial<Customer>>(data.identity || {});
  const [isValid, setIsValid] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [addressLookup, setAddressLookup] = useState('');
  const [showManualAddress, setShowManualAddress] = useState(false);

  useEffect(() => {
    // Validate form
    const valid = !!(
      identity.name &&
      identity.email &&
      identity.phone &&
      identity.address?.line1 &&
      identity.address?.city &&
      identity.address?.postcode &&
      documentUploaded
    );
    setIsValid(valid);
  }, [identity, documentUploaded]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setIdentity(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setIdentity(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    if (isValid) {
      onUpdate({ identity });
      onComplete();
    }
  };

  const handleDocumentUpload = () => {
    // Mock document upload with preview
    setDocumentUploaded(true);
    setDocumentPreview('/api/placeholder/200/150'); // Mock preview URL
  };

  const handleRetakeDocument = () => {
    setDocumentUploaded(false);
    setDocumentPreview(null);
  };

  const handleAddressLookup = () => {
    // Mock postcode lookup
    if (addressLookup.toLowerCase().includes('sw1a')) {
      setIdentity(prev => ({
        ...prev,
        address: {
          ...prev.address,
          line1: '10 Downing Street',
          city: 'London',
          postcode: 'SW1A 2AA',
          country: 'United Kingdom'
        }
      }));
    }
  };

  // Update parent component when identity changes
  useEffect(() => {
    onUpdate({ identity });
  }, [identity, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Let's verify your identity</h2>
        <p className="text-muted-foreground">
          We need some basic information to get started with your application.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
            <CardDescription>
              Please provide your full legal name as it appears on your ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={identity.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={identity.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={identity.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+44 7700 900123"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Home Address
            </CardTitle>
            <CardDescription>
              Your residential address for identity verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showManualAddress && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="postcode-lookup">Postcode Lookup</Label>
                  <div className="flex gap-2">
                    <Input
                      id="postcode-lookup"
                      value={addressLookup}
                      onChange={(e) => setAddressLookup(e.target.value)}
                      placeholder="Enter postcode (e.g., SW1A 1AA)"
                    />
                    <Button variant="outline" onClick={handleAddressLookup}>
                      <Search className="h-4 w-4 mr-2" />
                      Find
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowManualAddress(true)}
                  className="text-primary"
                >
                  Enter address manually
                </Button>
              </div>
            )}
            
            {(showManualAddress || identity.address?.line1) && (
              <div className="space-y-4">
                {showManualAddress && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowManualAddress(false)}
                    className="text-primary mb-2"
                  >
                    ← Back to postcode lookup
                  </Button>
                )}
                <div>
                  <Label htmlFor="address-line1">Address Line 1 *</Label>
                  <Input
                    id="address-line1"
                    value={identity.address?.line1 || ''}
                    onChange={(e) => handleInputChange('address.line1', e.target.value)}
                    placeholder="123 High Street"
                  />
                </div>
                <div>
                  <Label htmlFor="address-line2">Address Line 2</Label>
                  <Input
                    id="address-line2"
                    value={identity.address?.line2 || ''}
                    onChange={(e) => handleInputChange('address.line2', e.target.value)}
                    placeholder="Apartment 4B"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={identity.address?.city || ''}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="London"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={identity.address?.postcode || ''}
                      onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                      placeholder="SW1A 1AA"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Identity Document
            </CardTitle>
            <CardDescription>
              Upload a photo of your passport, driving license, or national ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!documentUploaded ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop your document here, or click to browse
                </p>
                <Button variant="outline" onClick={handleDocumentUpload}>
                  Upload Document
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: JPG, PNG, PDF (max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-success-light rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="font-medium text-success">Document uploaded successfully</p>
                    <p className="text-sm text-success/80">passport.jpg - 2.4 MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRetakeDocument}>
                    <X className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                </div>
                
                {documentPreview && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Document Preview</p>
                    <img 
                      src={documentPreview} 
                      alt="Document preview" 
                      className="w-32 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!isValid}
          className={isValid ? 'btn-success' : ''}
        >
          {completed ? 'Update Information' : 'Verify Identity'}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Required fields notice */}
      <p className="text-xs text-muted-foreground">
        * Required fields. All information will be encrypted and stored securely.
      </p>
    </div>
  );
}