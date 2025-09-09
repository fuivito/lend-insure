import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockBrokerClients, type BrokerClient } from '@/lib/demo/brokerClients';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  PoundSterling,
  Calendar,
  TrendingUp,
  User,
  Check
} from 'lucide-react';

interface AgreementData {
  client: BrokerClient | null;
  premium: number;
  duration: number;
  apr: number;
}

const initialData: AgreementData = {
  client: null,
  premium: 1000,
  duration: 12,
  apr: 15
};

const BASE_APR = 15;
const MAX_APR = 25;
const BASE_COMMISSION_RATE = 0.02; // 2%
const UPLIFT_SHARE_RATE = 0.01; // 1% for each point above base APR

export function CreateAgreement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [agreementData, setAgreementData] = useState<AgreementData>(initialData);

  // Pre-select client if coming from client detail page
  const preSelectedClientId = searchParams.get('clientId');
  const preSelectedClient = preSelectedClientId ? 
    mockBrokerClients.find(c => c.id === preSelectedClientId) : null;
  
  // Initialize with pre-selected client if available
  if (preSelectedClient && !agreementData.client) {
    setAgreementData(prev => ({ ...prev, client: preSelectedClient }));
  }

  const filteredClients = mockBrokerClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateRevenue = () => {
    const baseCommission = agreementData.premium * BASE_COMMISSION_RATE;
    const aprUplift = Math.max(0, agreementData.apr - BASE_APR);
    const upliftShare = agreementData.premium * UPLIFT_SHARE_RATE * aprUplift;
    const totalRevenue = baseCommission + upliftShare;
    
    return {
      baseCommission,
      upliftShare,
      totalRevenue
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const handleSelectClient = (client: BrokerClient) => {
    setAgreementData(prev => ({ ...prev, client }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSendToClient = () => {
    console.log('Sending agreement to client:', {
      client: agreementData.client,
      premium: agreementData.premium,
      duration: agreementData.duration,
      apr: agreementData.apr,
      revenue: calculateRevenue()
    });
    
    toast({
      title: "Agreement sent successfully!",
      description: `Agreement sent to ${agreementData.client?.name}`,
    });
    
    navigate('/app/broker/agreements');
  };

  const revenue = calculateRevenue();

  const steps = [
    { number: 1, title: 'Select Client', icon: User },
    { number: 2, title: 'Financing Parameters', icon: TrendingUp },
    { number: 3, title: 'Review & Send', icon: FileText }
  ];

  const canProceedFromStep1 = agreementData.client !== null;
  const canProceedFromStep2 = agreementData.premium > 0 && agreementData.duration > 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/broker/agreements')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Agreement</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new financing agreement for your client
          </p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <div className="ml-2 hidden sm:block">
              <div className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select Client</h3>
                <p className="text-muted-foreground">
                  Choose an existing client or add a new one
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Add New Client Button */}
              <Button
                variant="outline"
                onClick={() => navigate('/app/broker/clients/new')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add new client
              </Button>

              {/* Client List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      agreementData.client?.id === client.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <Badge variant="secondary">{client.agreementCount} agreements</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No clients found matching your search.
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Financing Parameters</h3>
                <p className="text-muted-foreground">
                  Set the premium amount, duration, and APR for this agreement
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="premium">Premium Amount (£)</Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="premium"
                        type="number"
                        value={agreementData.premium}
                        onChange={(e) => setAgreementData(prev => ({ 
                          ...prev, 
                          premium: Number(e.target.value) 
                        }))}
                        className="pl-10"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={agreementData.duration.toString()}
                      onValueChange={(value) => setAgreementData(prev => ({ 
                        ...prev, 
                        duration: Number(value) 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Annual Percentage Rate (APR)</Label>
                      <div className="mt-2 mb-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Baseline: {BASE_APR}%</span>
                          <span>Max: {MAX_APR}%</span>
                        </div>
                        <Slider
                          value={[agreementData.apr]}
                          onValueChange={(value) => setAgreementData(prev => ({ 
                            ...prev, 
                            apr: value[0] 
                          }))}
                          min={BASE_APR}
                          max={MAX_APR}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="mt-2 text-center">
                          <span className="text-2xl font-bold text-primary">
                            {agreementData.apr.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Preview Card */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Commission</p>
                      <p className="text-lg font-semibold">{formatCurrency(revenue.baseCommission)}</p>
                      <p className="text-xs text-muted-foreground">2% of premium</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uplift Share</p>
                      <p className="text-lg font-semibold">{formatCurrency(revenue.upliftShare)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((agreementData.apr - BASE_APR) * UPLIFT_SHARE_RATE * 100).toFixed(1)}% additional
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Broker Revenue</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(revenue.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((revenue.totalRevenue / agreementData.premium) * 100).toFixed(1)}% of premium
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Send</h3>
                <p className="text-muted-foreground">
                  Review the agreement details before sending to your client
                </p>
              </div>

              {/* Agreement Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Agreement Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{agreementData.client?.name}</p>
                      <p className="text-sm text-muted-foreground">{agreementData.client?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Premium Amount</p>
                      <p className="text-lg font-semibold">{formatCurrency(agreementData.premium)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{agreementData.duration} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">APR</p>
                      <p className="text-lg font-semibold text-primary">{agreementData.apr.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Revenue</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(revenue.totalRevenue)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Sample PDF Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Agreement Document Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">Financing Agreement</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      A professional PDF document will be generated and sent to your client
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Terms and conditions</p>
                      <p>• Payment schedule</p>
                      <p>• Client signature required</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/app/broker/agreements')}
          >
            Cancel
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedFromStep1) ||
                (currentStep === 2 && !canProceedFromStep2)
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSendToClient}>
              Send to Client
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}