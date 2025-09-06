import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6">
        {/* Hero Card Skeleton */}
        <Card className="card-hero">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="text-center lg:text-left">
                <Skeleton className="h-7 w-48 mb-4 mx-auto lg:mx-0" />
                <Skeleton className="h-14 w-40 mb-6 mx-auto lg:mx-0" />
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-6">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4">
                  <Skeleton className="h-4 w-36 mb-3" />
                  <div className="flex gap-3 justify-center lg:justify-start mb-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-3 w-8 mb-1" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="card-premium">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-3 w-full" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments Skeleton */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}