import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ArrearsBannerProps {
  isInArrears: boolean;
}

export function ArrearsBanner({ isInArrears }: ArrearsBannerProps) {
  if (!isInArrears) return null;

  return (
    <Card className="border-destructive/20 bg-destructive/5 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg font-bold text-destructive mb-1">
              Payment Overdue
            </h3>
            <p className="text-sm text-destructive/80">
              Your account is in arrears. Don't worry - we're here to help you get back on track.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Get Support Options
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}