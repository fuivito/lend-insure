import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, ArrowRight, Shield, Clock } from 'lucide-react';

export default function StartPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    // If there's a token, this is a deep-link onboarding
    if (token === 'demo') {
      // Pre-fill with demo data and proceed
      localStorage.setItem('onboarding-prefilled', 'true');
    }
  }, [token]);

  const handleStartOnboarding = async () => {
    // Login as customer
    await login('customer');
    
    // Clear any existing onboarding data
    localStorage.removeItem('onboarding-completed');
    
    // Navigate to onboarding
    navigate('/app/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-foreground">LendInsure</h1>
              <p className="text-xs text-muted-foreground">Premium Finance</p>
            </div>
          </div>
          
          {token && (
            <Badge variant="outline" className="status-success">
              Pre-filled Application
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Start Your Application
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete your premium finance application in just a few minutes. 
            We'll guide you through each step.
          </p>
        </div>

        {/* Application Card */}
        <Card className="card-premium max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Premium Finance Application</CardTitle>
            <CardDescription>
              {token ? 
                'Your application has been pre-filled with the provided information. Review and complete the remaining steps.' :
                'Follow our simple 5-step process to set up your premium finance plan.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Process Steps */}
            <div className="grid gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <div className="font-medium">Identity Verification</div>
                  <div className="text-sm text-muted-foreground">Personal details and ID verification</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <div className="font-medium">Credit Assessment</div>
                  <div className="text-sm text-muted-foreground">Quick soft credit check</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <div className="font-medium">Bank Connection</div>
                  <div className="text-sm text-muted-foreground">Secure Open Banking connection</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <div className="font-medium">Plan Review</div>
                  <div className="text-sm text-muted-foreground">Review terms and payment schedule</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  5
                </div>
                <div>
                  <div className="font-medium">Digital Signature</div>
                  <div className="text-sm text-muted-foreground">Sign your agreement electronically</div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center space-x-3 p-4 bg-success-light rounded-lg">
              <Shield className="h-5 w-5 text-success" />
              <div className="text-sm">
                <div className="font-medium text-success">Secure & Encrypted</div>
                <div className="text-success/80">All data is protected with bank-level security</div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="flex items-center space-x-3 p-4 bg-primary-light rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium text-primary">Estimated Time</div>
                <div className="text-primary/80">5-10 minutes to complete</div>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              className="w-full btn-hero text-lg py-6"
              onClick={handleStartOnboarding}
            >
              {token ? 'Continue Application' : 'Start Application'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Legal Notice */}
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{' '}
              <a href="/legal/terms" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              You consent to a soft credit check which won't affect your credit score.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}