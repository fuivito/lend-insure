import { useParams, useNavigate } from 'react-router-dom';
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
import { mockBrokerClients } from '@/lib/demo/brokerClients';
import { mockBrokerAgreements } from '@/lib/demo/brokerAgreements';
import { ArrowLeft, Plus, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the client
  const client = mockBrokerClients.find(c => c.id === id);
  
  // Get client's agreements
  const clientAgreements = mockBrokerAgreements.filter(agreement => agreement.clientId === id);

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Client Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested client could not be found.</p>
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

  const handleCreateProposal = () => {
    navigate(`/app/broker/agreements/new?clientId=${id}`);
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
          <h1 className="text-3xl font-bold text-foreground">Client: {client.name}</h1>
          <p className="text-muted-foreground mt-2">
            View client details and manage agreements
          </p>
        </div>
        <Button onClick={handleCreateProposal}>
          <Plus className="h-4 w-4 mr-2" />
          Create new financing proposal
        </Button>
      </div>

      {/* Client Information Card */}
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
              <p className="text-foreground">{client.phone}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last Activity
              </div>
              <p className="text-foreground">{formatDate(client.lastActivity)}</p>
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <p className="text-foreground">
                {/* Mock address since it's not in the client data */}
                {client.id === 'client-001' && '45 Oak Street, Manchester, M1 2AB'}
                {client.id === 'client-002' && '12 Elm Avenue, Birmingham, B2 4CD'}
                {client.id === 'client-003' && '78 Pine Road, Leeds, LS1 3EF'}
                {client.id === 'client-004' && '33 Maple Close, Bristol, BS1 5GH'}
                {client.id === 'client-005' && '156 Birch Lane, Liverpool, L1 7IJ'}
                {client.id === 'client-006' && '91 Cedar Drive, Newcastle, NE1 8KL'}
                {client.id === 'client-007' && '22 Willow Gardens, Sheffield, S1 9MN'}
                {client.id === 'client-008' && '67 Ash Court, Nottingham, NG1 0PQ'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agreements Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agreements</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {clientAgreements.length} agreement{clientAgreements.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clientAgreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agreement ID</TableHead>
                    <TableHead>Policy Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">APR</TableHead>
                    <TableHead className="text-right">Premium</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientAgreements.map((agreement) => (
                    <TableRow key={agreement.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{agreement.id}</TableCell>
                      <TableCell>{agreement.policyType}</TableCell>
                      <TableCell>{formatDate(agreement.startDate)}</TableCell>
                      <TableCell>{formatDate(agreement.endDate)}</TableCell>
                      <TableCell className="text-right">{agreement.apr}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(agreement.premium)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(agreement.status)}
                        >
                          {agreement.status}
                        </Badge>
                      </TableCell>
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