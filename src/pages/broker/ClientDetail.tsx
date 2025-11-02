import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api/client';
import { EditClientForm } from '@/components/broker/EditClientForm';
import { ArrowLeft, Plus, Mail, Phone, MapPin, Calendar, Loader2, Edit, Save, X } from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  created_at: string;
}

interface Agreement {
  id: string;
  client_id: string;
  policy_id: string;
  principal_amount_pennies: number;
  apr_bps: number;
  status: string;
  created_at: string;
  signed_at: string;
  activated_at: string;
  term_months: number;
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch client details
        const clientResponse = await apiClient.getClient(id);
        setClient(clientResponse);
        
        // Fetch client's agreements
        const agreementsResponse = await apiClient.getAgreements({ client_id: id });
        setAgreements(agreementsResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch client data');
        console.error('Error fetching client data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {error ? 'Error Loading Client' : 'Client Not Found'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || 'The requested client could not be found.'}
          </p>
          <Button onClick={() => navigate('/app/broker/clients')}>
            Back to Clients
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROPOSED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SIGNED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DEFAULTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateProposal = () => {
    navigate(`/app/broker/deal-builder?clientId=${id}`);
  };

  const handleAgreementClick = (agreementId: string) => {
    navigate(`/app/broker/agreements/${agreementId}`);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveClient = async (data: Partial<Client>) => {
    if (!client) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedClient = await apiClient.updateClient(client.id, data);
      setClient(updatedClient);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update client');
      console.error('Error updating client:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            Client: {client.first_name} {client.last_name}
          </h1>
          <p className="text-muted-foreground mt-2">
            View client details and manage agreements
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEditClick}
            disabled={isEditing}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
          <Button onClick={handleCreateProposal}>
            <Plus className="h-4 w-4 mr-2" />
            Create new financing proposal
          </Button>
        </div>
      </div>

      {/* Save Error Alert */}
      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Client Information Card */}
      {isEditing ? (
        <EditClientForm
          client={client}
          onSave={handleSaveClient}
          onCancel={handleCancelEdit}
          isLoading={isSaving}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="text-foreground">{client.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone
                </div>
                <p className="text-foreground">{client.phone || 'No phone provided'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="text-foreground">{formatDate(client.created_at)}</p>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
                <p className="text-foreground">
                  {client.address_line1 && (
                    <>
                      {client.address_line1}
                      {client.address_line2 && `, ${client.address_line2}`}
                      {client.city && `, ${client.city}`}
                      {client.postcode && `, ${client.postcode}`}
                    </>
                  )}
                  {!client.address_line1 && 'No address provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agreements Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agreements</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {agreements.length} agreement{agreements.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agreement ID</TableHead>
                    <TableHead>Policy ID</TableHead>
                    <TableHead>Principal Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead className="text-right">APR</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement) => (
                    <TableRow 
                      key={agreement.id} 
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleAgreementClick(agreement.id)}
                    >
                      <TableCell className="font-medium">{agreement.id}</TableCell>
                      <TableCell>{agreement.policy_id}</TableCell>
                      <TableCell>{formatCurrency(agreement.principal_amount_pennies / 100)}</TableCell>
                      <TableCell>{agreement.term_months} months</TableCell>
                      <TableCell className="text-right">{(agreement.apr_bps / 100).toFixed(2)}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(agreement.status)}
                        >
                          {agreement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(agreement.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No agreements found for this client.</p>
              <Button onClick={handleCreateProposal} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create first agreement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}