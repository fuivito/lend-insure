import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'warning' | 'destructive';
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, icon, onClick, className, variant = 'default', ...props }, ref) => {
    const isClickable = !!onClick;
    
    const variantStyles = {
      default: 'border-border',
      primary: 'border-primary/20 bg-primary/5',
      warning: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
      destructive: 'border-destructive/20 bg-destructive/5'
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-2xl shadow-sm transition-colors",
          variantStyles[variant],
          isClickable && "cursor-pointer hover:border-primary/40 hover:shadow-md",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <p className="text-2xl font-bold text-foreground truncate">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {icon && (
              <div className="ml-3 flex-shrink-0 text-muted-foreground">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };