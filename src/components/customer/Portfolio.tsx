import * as React from "react";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { PlanCard } from "./PlanCard";
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Search,
  RefreshCw
} from "lucide-react";
import { useAgreements, filterAndSort, type AgreementFilters } from "@/lib/demo/useAgreements";
import { format } from "date-fns";

const Portfolio = () => {
  const { data: agreements, isLoading, error, stats } = useAgreements();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<AgreementFilters>({
    filter: 'all',
    sort: 'nextDue',
    q: ''
  });

  const filteredAgreements = useMemo(() => 
    filterAndSort(agreements, filters), 
    [agreements, filters]
  );

  const handleNextPaymentClick = () => {
    if (stats.nextPayment) {
      navigate(`/app/customer/agreements/${stats.nextPayment.id}/overview`);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Plans skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">
              We couldn't load your financing plans. Please try again.
            </p>
          </div>
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (agreements.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">No active financing yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have any active financing plans. Start your first application to get started.
            </p>
          </div>
          <Link to="/start?token=demo">
            <Button size="lg">Start Financing</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
        <p className="text-muted-foreground">
          Overview of all your financing plans and payment schedules
        </p>
      </div>

      {/* At a glance stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Plans"
          value={stats.activeCount}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Total Outstanding"
          value={`£${stats.totalOutstanding.toFixed(2)}`}
          icon={<CreditCard className="w-5 h-5" />}
        />
        <StatCard
          title="Next Payment"
          value={stats.nextPayment ? `£${stats.nextPayment.amount.toFixed(2)}` : 'None'}
          subtitle={
            stats.nextPayment 
              ? `Due ${format(new Date(stats.nextPayment.date), 'dd MMM')}`
              : undefined
          }
          icon={<Calendar className="w-5 h-5" />}
          onClick={stats.nextPayment ? handleNextPaymentClick : undefined}
          variant={stats.nextPayment ? 'primary' : 'default'}
        />
        <StatCard
          title="In Arrears"
          value={stats.arrearsCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={stats.arrearsCount > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'arrears', label: 'In Arrears' },
            { key: 'completed', label: 'Completed', disabled: true }
          ].map(({ key, label, disabled }) => (
            <Button
              key={key}
              variant={filters.filter === key ? 'default' : 'outline'}
              size="sm"
              disabled={disabled}
              onClick={() => setFilters(prev => ({ ...prev, filter: key as any }))}
              className="rounded-full"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by policy, insurer, or broker..."
              value={filters.q}
              onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value as any }))}
          >
            <SelectTrigger className="w-32 sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextDue">Next due</SelectItem>
              <SelectItem value="highestOutstanding">Highest outstanding</SelectItem>
              <SelectItem value="recentlyCreated">Recently created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Plans List */}
      {filteredAgreements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No plans match your current filters. Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" role="list">
          {filteredAgreements.map((agreement) => (
            <PlanCard key={agreement.id} agreement={agreement} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Portfolio;