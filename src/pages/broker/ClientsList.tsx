import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockBrokerClients, type BrokerClient } from '@/lib/demo/brokerClients';
import { Search, Plus } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export function ClientsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter clients based on search query
  const filteredClients = mockBrokerClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered results
  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleClientClick = (clientId: string) => {
    navigate(`/app/broker/clients/${clientId}`);
  };

  const handleAddClient = () => {
    navigate('/app/broker/clients/new');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-muted-foreground mt-2">
          Manage your client relationships and agreements
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddClient} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add new client
        </Button>
      </div>

      {/* Clients Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="text-center"># Agreements</TableHead>
                <TableHead className="hidden md:table-cell">Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow 
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleClientClick(client.id)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {client.phone}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{client.agreementCount}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(client.lastActivity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredClients.length)} of {filteredClients.length} clients
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clients found matching your search.</p>
        </div>
      )}
    </div>
  );
}