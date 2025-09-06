import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { initialOnboardingState, type OnboardingState } from '@/lib/fixtures';

// Import step components
import { IdentityStep } from './steps/IdentityStep';
import { CreditCheckStep } from './steps/CreditCheckStep';
import { BankSetupStep } from './steps/BankSetupStep';
import { PlanSummaryStep } from './steps/PlanSummaryStep';
import { ESignatureStep } from './steps/ESignatureStep';

const steps = [
  { id: 1, title: 'Identity', component: IdentityStep },
  { id: 2, title: 'Credit Check', component: CreditCheckStep },
  { id: 3, title: 'Bank Setup', component: BankSetupStep },
  { id: 4, title: 'Plan Summary', component: PlanSummaryStep },
  { id: 5, title: 'E-signature', component: ESignatureStep },
];

export default function OnboardingWizard() {
  const [state, setState] = useState<OnboardingState>(initialOnboardingState);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved onboarding state:', error);
      }
    }

    // Check for pre-filled data
    const prefilled = localStorage.getItem('onboarding-prefilled');
    if (prefilled === 'true') {
      // Pre-fill with demo data
      setState(prev => ({
        ...prev,
        data: {
          identity: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+44 7700 900123',
            address: {
              line1: '123 High Street',
              line2: 'Apartment 4B',
              city: 'London',
              postcode: 'SW1A 1AA',
              country: 'United Kingdom'
            }
          }
        }
      }));
      localStorage.removeItem('onboarding-prefilled');
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding-state', JSON.stringify(state));
  }, [state]);

  const currentStep = steps.find(step => step.id === state.currentStep);
  const progress = ((state.currentStep - 1) / (steps.length - 1)) * 100;

  const canGoNext = () => {
    return state.completedSteps.includes(state.currentStep);
  };

  const canGoBack = () => {
    return state.currentStep > 1;
  };

  const handleNext = async () => {
    if (state.currentStep === steps.length) {
      // Complete onboarding
      setIsLoading(true);
      try {
        authService.setOnboardingCompleted();
        localStorage.removeItem('onboarding-state');
        navigate('/app/dashboard');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        setIsLoading(false);
      }
    } else {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
  };

  const handleBack = () => {
    if (canGoBack()) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const updateStepData = (stepData: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...stepData }
    }));
  };

  const completeStep = (stepId: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps.filter(id => id !== stepId), stepId]
    }));
  };

  if (!currentStep) {
    return <div>Step not found</div>;
  }

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress Bar */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-heading text-xl font-bold">Application Setup</h1>
              <div className="text-sm text-muted-foreground">
                Step {state.currentStep} of {steps.length}
              </div>
            </div>
            <Progress value={progress} className="progress-premium h-2" />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Rail */}
        <aside className="w-64 border-r border-border bg-card/50 p-6">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg mb-6">Setup Steps</h2>
            {steps.map((step, index) => {
              const isCompleted = state.completedSteps.includes(step.id);
              const isCurrent = step.id === state.currentStep;
              const isPast = step.id < state.currentStep;
              
              return (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0
                    ${isCompleted 
                      ? 'bg-success text-success-foreground' 
                      : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      isCurrent ? 'text-foreground' : isCompleted || isPast ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    }`}>
                      {step.title}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-primary font-medium">Current step</div>
                    )}
                    {isCompleted && (
                      <div className="text-xs text-success">Completed</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold mb-2">{currentStep.title}</h2>
            </div>

            <Card className="card-premium">
              <CardContent className="p-8">
                <StepComponent
                  data={state.data}
                  onUpdate={updateStepData}
                  onComplete={() => completeStep(state.currentStep)}
                  completed={state.completedSteps.includes(state.currentStep)}
                />
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack()}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canGoNext() || isLoading}
                className="flex items-center btn-hero"
              >
                {state.currentStep === steps.length ? 'Complete Application' : 'Continue'}
                {state.currentStep < steps.length && (
                  <ChevronRight className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}