import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Settings } from 'lucide-react';

export function DemoControls() {
  const { user, organisation, membership, signOut } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-card border-border shadow-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            Dev Info
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Development Info</SheetTitle>
            <SheetDescription>
              Current auth state and environment details.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Current User */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Current User</Label>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {user?.name || 'Not signed in'}</p>
                <p><span className="text-muted-foreground">Email:</span> {user?.email || '-'}</p>
                <p><span className="text-muted-foreground">User ID:</span> {user?.id || '-'}</p>
              </div>
            </div>

            {/* Organisation */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Organisation</Label>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {organisation?.name || '-'}</p>
                <p><span className="text-muted-foreground">Type:</span> {organisation?.orgType || '-'}</p>
                <p><span className="text-muted-foreground">Org ID:</span> {organisation?.id || '-'}</p>
              </div>
            </div>

            {/* Membership */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Membership</Label>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Role:</span> {membership?.role || '-'}</p>
                <p><span className="text-muted-foreground">Status:</span> {membership?.status || '-'}</p>
              </div>
            </div>

            {/* Environment Info */}
            <div className="pt-4 border-t border-border">
              <Label className="text-base font-medium">Environment</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Development build
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                API: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
              </p>
            </div>

            {/* Sign out button */}
            {user && (
              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
