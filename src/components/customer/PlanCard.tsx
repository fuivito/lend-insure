import * as React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Calendar, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Agreement } from "@/lib/demo/fixtures";

export interface PlanCardProps {
  agreement: Agreement;
  className?: string;
}

const PlanCard = React.forwardRef<HTMLDivElement, PlanCardProps>(
  ({ agreement, className }, ref) => {
    const {
      id,
      policyRef,
      product,
      insurer,
      broker,
      status,
      monthlyAmount,
      nextDueDate,
      remainingTerm,
      outstanding,
      lastPayment
    } = agreement;

    const detailsUrl = `/app/customer/agreements/${id}/overview`;
    
    const statusVariant = status === 'ARREARS' ? 'destructive' : 'default';
    const statusColor = status === 'ARREARS' ? 'text-destructive' : 'text-green-600';
    
    const PaymentIcon = lastPayment.status === 'PAID' ? CheckCircle : AlertCircle;
    const paymentIconColor = lastPayment.status === 'PAID' 
      ? 'text-green-600' 
      : 'text-destructive';

    const handleCardClick = (e: React.MouseEvent) => {
      // Prevent card click when clicking buttons or links inside
      if ((e.target as HTMLElement).closest('button, a[href]')) {
        return;
      }
      window.location.href = detailsUrl;
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
          "hover:border-primary/40",
          className
        )}
        onClick={handleCardClick}
        role="listitem"
        aria-label={`Open plan ${policyRef} details`}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-base leading-tight">
                {product || policyRef}
              </h3>
              <Badge variant={statusVariant} className="text-xs shrink-0">
                {status}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>{insurer} • {broker}</p>
              <p className="font-mono text-xs">{policyRef}</p>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="w-3 h-3" />
              £{monthlyAmount.toFixed(2)}/mo
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(nextDueDate), 'dd MMM')}
            </div>
            <div className="text-xs text-muted-foreground">
              {remainingTerm.paid}/{remainingTerm.total} paid
            </div>
          </div>

          {/* Secondary Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Outstanding: </span>
              <span className="font-semibold text-foreground">
                £{outstanding.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <PaymentIcon className={cn("w-4 h-4", paymentIconColor)} />
              <span className={cn("text-xs font-medium", paymentIconColor)}>
                {lastPayment.status === 'PAID' ? 'Paid' : 'Missed'}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link to={detailsUrl} onClick={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              variant="default"
              className="w-full sm:w-auto group-hover:bg-primary/90"
            >
              View details
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
);

PlanCard.displayName = "PlanCard";

export { PlanCard };