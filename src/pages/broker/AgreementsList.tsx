import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { mockBrokerAgreements } from '@/lib/demo/brokerAgreements';
import { mockBrokerClients } from '@/lib/demo/brokerClients';
import { Search, Filter } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

type StatusFilter = 'all' | 'Active' | 'Pending' | 'Completed' | 'Defaulted';

export function AgreementsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Create a map of client IDs to client names for quick lookup
  const clientMap = mockBrokerClients.reduce((acc, client) => {
    acc[client.id] = client.name;
    return acc;
  }, {} as Record<string, string>);

  // Filter agreements based on search query and status
  const filteredAgreements = mockBrokerAgreements.filter(agreement => {
    const clientName = clientMap[agreement.clientId] || 'Unknown Client';
    const matchesSearch = 
      agreement.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agreement.policyType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered results
  const totalPages = Math.ceil(filteredAgreements.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAgreements = filteredAgreements.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  // Calculate broker revenue (mock calculation - 2% of premium)
  const calculateBrokerRevenue = (premium: number) => {
    return premium * 0.02;
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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleRowClick = (agreementId: string, clientId: string) => {
    // Navigate to client detail page (since we don't have individual agreement pages yet)
    navigate(`/app/broker/clients/${clientId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agreements</h1>
        <p className="text-muted-foreground mt-2">
          Manage all client agreements and track performance
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by agreement ID, client, or policy type..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Agreements Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement ID</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Policy Type</TableHead>
                <TableHead className="hidden md:table-cell">Start Date</TableHead>
                <TableHead className="hidden md:table-cell">End Date</TableHead>
                <TableHead className="text-right">APR</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Broker Revenue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAgreements.map((agreement) => (
                <TableRow 
                  key={agreement.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(agreement.id, agreement.clientId)}
                >
                  <TableCell className="font-medium">{agreement.id}</TableCell>
                  <TableCell>{clientMap[agreement.clientId] || 'Unknown Client'}</TableCell>
                  <TableCell className="text-muted-foreground">{agreement.policyType}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(agreement.startDate)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(agreement.endDate)}
                  </TableCell>
                  <TableCell className="text-right font-medium">{agreement.apr}%</TableCell>
                  <TableCell className="text-right font-medium hidden sm:table-cell">
                    {formatCurrency(calculateBrokerRevenue(agreement.premium))}
                  </TableCell>
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
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAgreements.length)} of {filteredAgreements.length} agreements
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              const isVisible = page === 1 || page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!isVisible && totalPages > 5) {
                if (page === 2 && currentPage > 4) return <span key="start-ellipsis">...</span>;
                if (page === totalPages - 1 && currentPage < totalPages - 3) return <span key="end-ellipsis">...</span>;
                return null;
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
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
      {filteredAgreements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agreements found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}