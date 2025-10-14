import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { mockExtractedData, type ExtractedClientData } from '@/lib/demo/ocrExtraction';
import { apiClient } from '@/lib/api/client';
import { Upload, FileText, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
}

const initialFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: ''
};

export function AddClient() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedClientData | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    // Mock processing delay
    setTimeout(() => {
      setExtractedData(mockExtractedData);
      // Parse the extracted name into first and last name
      const nameParts = mockExtractedData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        firstName,
        lastName,
        email: mockExtractedData.email,
        phone: mockExtractedData.phone,
        addressLine1: mockExtractedData.address,
        addressLine2: '',
        city: '',
        postcode: ''
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setIsProcessing(true);

      // Mock processing delay
      setTimeout(() => {
        setExtractedData(mockExtractedData);
      // Parse the extracted name into first and last name
      const nameParts = mockExtractedData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        firstName,
        lastName,
        email: mockExtractedData.email,
        phone: mockExtractedData.phone,
        addressLine1: mockExtractedData.address,
        addressLine2: '',
        city: '',
        postcode: ''
      });
        setIsProcessing(false);
      }, 2000);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Saving client:', formData);
      
      // Convert form data to API format
      const clientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2,
        city: formData.city,
        postcode: formData.postcode
      };
      
      await apiClient.createClient(clientData);
      alert('Client saved successfully!');
      navigate('/app/broker/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Check className="h-3 w-3" />;
    if (confidence >= 80) return <AlertCircle className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/broker/clients')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Client</h1>
          <p className="text-muted-foreground mt-2">
            Upload a PDF document or enter client details manually
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* File Upload Section */}
          {!uploadedFile && (
            <Card>
              <CardContent className="p-6">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload PDF Document</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported format: PDF (max 10MB)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing State */}
          {uploadedFile && isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium">{uploadedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">Processing document...</p>
                  </div>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extracted Data Preview */}
          {extractedData && !isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Extracted Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and edit the extracted information below
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="extracted-firstname">First Name</Label>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(extractedData.confidence.name)}`}
                      >
                        {getConfidenceIcon(extractedData.confidence.name)}
                        {extractedData.confidence.name}%
                      </Badge>
                    </div>
                    <Input
                      id="extracted-firstname"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="extracted-lastname">Last Name</Label>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(extractedData.confidence.name)}`}
                      >
                        {getConfidenceIcon(extractedData.confidence.name)}
                        {extractedData.confidence.name}%
                      </Badge>
                    </div>
                    <Input
                      id="extracted-lastname"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="extracted-email">Email</Label>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(extractedData.confidence.email)}`}
                      >
                        {getConfidenceIcon(extractedData.confidence.email)}
                        {extractedData.confidence.email}%
                      </Badge>
                    </div>
                    <Input
                      id="extracted-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="extracted-phone">Phone</Label>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(extractedData.confidence.phone)}`}
                      >
                        {getConfidenceIcon(extractedData.confidence.phone)}
                        {extractedData.confidence.phone}%
                      </Badge>
                    </div>
                    <Input
                      id="extracted-phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label>Address</Label>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(extractedData.confidence.address)}`}
                    >
                      {getConfidenceIcon(extractedData.confidence.address)}
                      {extractedData.confidence.address}%
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="extracted-address1">Address Line 1</Label>
                      <Input
                        id="extracted-address1"
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="extracted-address2">Address Line 2</Label>
                      <Input
                        id="extracted-address2"
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="extracted-city">City</Label>
                      <Input
                        id="extracted-city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="extracted-postcode">Postcode</Label>
                      <Input
                        id="extracted-postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the client details manually
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-firstname">First Name *</Label>
                  <Input
                    id="manual-firstname"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-lastname">Last Name *</Label>
                  <Input
                    id="manual-lastname"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-email">Email *</Label>
                  <Input
                    id="manual-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-phone">Phone</Label>
                  <Input
                    id="manual-phone"
                    placeholder="+44 7700 900000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Address</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manual-address1">Address Line 1</Label>
                    <Input
                      id="manual-address1"
                      placeholder="Street address"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manual-address2">Address Line 2</Label>
                    <Input
                      id="manual-address2"
                      placeholder="Apartment, suite, etc."
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manual-city">City</Label>
                    <Input
                      id="manual-city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manual-postcode">Postcode</Label>
                    <Input
                      id="manual-postcode"
                      placeholder="SW1A 1AA"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/app/broker/clients')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.firstName || !formData.lastName || !formData.email}
        >
          Save Client
        </Button>
      </div>
    </div>
  );
}