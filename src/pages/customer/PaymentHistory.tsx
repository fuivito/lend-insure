import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  History, 
  Download, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { mockPayments } from '@/lib/fixtures';

export default function PaymentHistory() {
  const [filter, setFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="status-success">Paid</Badge>;
      case 'pending':
        return <Badge className="status-warning">Pending</Badge>;
      case 'overdue':
        return <Badge className="status-destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredPayments = mockPayments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Payment History
        </h1>
        <p className="text-muted-foreground">
          View all your premium finance payments and download statements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              £{mockPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {mockPayments.filter(p => p.status === 'paid').length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {mockPayments.filter(p => p.status === 'pending').length} payments
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{mockPayments.find(p => p.status === 'pending')?.amount.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              {mockPayments.find(p => p.status === 'pending') ? 
                new Date(mockPayments.find(p => p.status === 'pending')!.dueDate).toLocaleDateString('en-GB') :
                'No upcoming payments'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                All Payments
              </CardTitle>
              <CardDescription>
                Complete history of your premium finance payments
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paymentDate ? 
                        new Date(payment.paymentDate).toLocaleDateString('en-GB') :
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(payment.dueDate).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="font-medium">
                      £{payment.amount.toLocaleString()}
                      {payment.fees && (
                        <div className="text-xs text-destructive">
                          +£{payment.fees} fee
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.method || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference || '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                No payments match your current filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="card-premium mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Payment Issues</h4>
              <p className="text-sm text-muted-foreground mb-3">
                If you notice any discrepancies or have questions about your payments, 
                please contact our support team.
              </p>
              <Button variant="outline" size="sm">
                Report Issue
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Payment Methods</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You can update your Direct Debit details or payment method at any time 
                through your account settings.
              </p>
              <Button variant="outline" size="sm">
                Update Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}