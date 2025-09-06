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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Settings, RotateCcw } from 'lucide-react';
import { authService } from '@/lib/auth';

export function DemoControls() {
  const { role, switchRole } = useAuth();
  const [creditCheckStatus, setCreditCheckStatus] = useState<'pending' | 'success' | 'failed'>('success');
  const [bankConnected, setBankConnected] = useState(true);
  const [arrearsState, setArrearsState] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding-completed');
    localStorage.removeItem('onboarding-state');
    window.location.reload();
  };

  const completeOnboarding = () => {
    authService.setOnboardingCompleted();
    window.location.reload();
  };

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
            Demo Controls
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Demo Controls</SheetTitle>
            <SheetDescription>
              Adjust demo states and user roles for testing purposes.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Role Switcher */}
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={role} onValueChange={switchRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="broker">Broker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Onboarding Controls */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Onboarding</Label>
              
              <div className="space-y-2">
                <Label>Current Step</Label>
                <Select value={onboardingStep.toString()} onValueChange={(value) => setOnboardingStep(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Identity</SelectItem>
                    <SelectItem value="2">2 - Credit Check</SelectItem>
                    <SelectItem value="3">3 - Bank Setup</SelectItem>
                    <SelectItem value="4">4 - Plan Summary</SelectItem>
                    <SelectItem value="5">5 - E-signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={resetOnboarding}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={completeOnboarding}>
                  Complete
                </Button>
              </div>
            </div>

            {/* State Controls */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Application States</Label>
              
              <div className="space-y-2">
                <Label>Credit Check Status</Label>
                <Select value={creditCheckStatus} onValueChange={(value) => setCreditCheckStatus(value as 'pending' | 'success' | 'failed')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="bank-connected"
                  checked={bankConnected}
                  onCheckedChange={setBankConnected}
                />
                <Label htmlFor="bank-connected">Bank Connected</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="arrears-state"
                  checked={arrearsState}
                  onCheckedChange={setArrearsState}
                />
                <Label htmlFor="arrears-state">Arrears State</Label>
              </div>
            </div>

            {/* Environment Info */}
            <div className="pt-4 border-t border-border">
              <Label className="text-base font-medium">Environment</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Development build with mock data
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}