import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { mockBrokerAgreements } from '@/lib/demo/brokerAgreements';
import { mockBrokerClients } from '@/lib/demo/brokerClients';
import { 
  mockAgreementDocuments, 
  mockAgreementActivity, 
  getStatusTimeline,
  type AgreementDocument,
  type AgreementActivity
} from '@/lib/demo/agreementDetails';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  User, 
  PoundSterling, 
  Calendar, 
  TrendingUp,
  Check,
  Circle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';

export function AgreementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find the agreement
  const agreement = mockBrokerAgreements.find(a => a.id === id);
  
  // Find the client
  const client = agreement ? mockBrokerClients.find(c => c.id === agreement.clientId) : null;
  
  // Get documents and activity
  const documents = id ? mockAgreementDocuments[id] || [] : [];
  const activities = id ? mockAgreementActivity[id] || [] : [];
  
  // Get status timeline
  const timeline = agreement ? getStatusTimeline(agreement.status, agreement.startDate) : [];

  if (!agreement || !client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Agreement Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested agreement could not be found.</p>
          <Button onClick={() => navigate('/app/broker/agreements')}>
            Back to Agreements
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const calculateBrokerRevenue = (premium: number, apr: number) => {
    const baseCommission = premium * 0.02;
    const aprUplift = Math.max(0, apr - 15);
    const upliftShare = premium * 0.01 * aprUplift;
    return baseCommission + upliftShare;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Defaulted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <FileText className="h-4 w-4" />;
      case 'sent': return <FileText className="h-4 w-4" />;
      case 'signed': return <Check className="h-4 w-4" />;
      case 'payment': return <PoundSterling className="h-4 w-4" />;
      case 'default': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return 'text-blue-600';
      case 'sent': return 'text-purple-600';
      case 'signed': return 'text-green-600';
      case 'payment': return 'text-green-600';
      case 'default': return 'text-red-600';
      case 'completed': return 'text-green-600';
      case 'note': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const handleDownloadDocument = (doc: AgreementDocument) => {
    toast({
      title: "Download started",
      description: `Downloading ${doc.name}`,
    });
    console.log('Downloading document:', doc);
  };

  const handleViewDocument = (doc: AgreementDocument) => {
    toast({
      title: "Opening document",
      description: `Opening ${doc.name} in viewer`,
    });
    console.log('Viewing document:', doc);
  };

  const handleCancelDraft = () => {
    toast({
      title: "Agreement cancelled",
      description: "The draft agreement has been cancelled",
    });
    console.log('Cancelling agreement:', agreement.id);
    navigate('/app/broker/agreements');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const brokerRevenue = calculateBrokerRevenue(agreement.premium, agreement.apr);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-foreground">Agreement {agreement.id}</h1>
            <p className="text-muted-foreground mt-2">
              {agreement.policyType} financing agreement
            </p>
          </div>
        </div>
        
        {agreement.status === 'Pending' && (
          <Button variant="destructive" onClick={handleCancelDraft}>
            <X className="h-4 w-4 mr-2" />
            Cancel Draft
          </Button>
        )}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agreement Summary</CardTitle>
            <Badge variant="outline" className={getStatusColor(agreement.status)}>
              {agreement.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  Client Information
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <PoundSterling className="h-4 w-4" />
                  Financing Details
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{formatCurrency(agreement.premium)}</p>
                  <p className="text-sm text-muted-foreground">Premium Amount</p>
                  <p className="text-sm font-medium">{agreement.apr}% APR</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Term Details
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{formatDate(agreement.startDate)}</p>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{formatDate(agreement.endDate)}</p>
                  <p className="text-sm text-muted-foreground">End Date</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Broker Revenue
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-primary">{formatCurrency(brokerRevenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((brokerRevenue / agreement.premium) * 100).toFixed(1)}% of premium
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((step, index) => (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.completed 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {step.completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="absolute left-4 mt-8 w-px h-4 bg-border" style={{ marginLeft: '16px' }} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Uploaded {formatDate(doc.uploadDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No documents available</h3>
                <p className="text-muted-foreground">Documents will appear here once the agreement is processed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {activities.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {activities.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="p-4 flex items-start gap-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{activity.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                        </div>
                      </div>
                      {index < activities.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No activity recorded</h3>
                <p className="text-muted-foreground">Activity history will appear here as events occur.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}