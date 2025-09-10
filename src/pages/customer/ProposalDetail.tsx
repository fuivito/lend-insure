import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewProposal } from '@/components/proposals/steps/ReviewProposal';
import { AdjustPlan } from '@/components/proposals/steps/AdjustPlan';
import { CreditIdentity } from '@/components/proposals/steps/CreditIdentity';
import { DigitalAgreement } from '@/components/proposals/steps/DigitalAgreement';
import { PaymentSetup } from '@/components/proposals/steps/PaymentSetup';
import { Confirmation } from '@/components/proposals/steps/Confirmation';
import { mockProposals } from '@/lib/demo/proposals';
import { Proposal } from '@/types/proposals';
import { ArrowLeft, CheckCircle, Circle, Clock, FileText, CreditCard, Shield, User, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const workflowSteps = [
  { id: 'review', title: 'Review Proposal', icon: FileText, description: 'Review terms and conditions' },
  { id: 'customize', title: 'Adjust Plan', icon: Clock, description: 'Customize payment schedule' },
  { id: 'kyc', title: 'Credit & Identity', icon: User, description: 'Business verification' },
  { id: 'agreement', title: 'Digital Agreement', icon: Shield, description: 'Sign financing agreement' },
  { id: 'payment', title: 'Payment Setup', icon: CreditCard, description: 'Setup direct debit' },
  { id: 'confirmation', title: 'Confirmation', icon: CheckCircle, description: 'Complete and download' }
];

export function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [currentStep, setCurrentStep] = useState('review');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      const found = mockProposals.find(p => p.id === id);
      if (found) {
        setProposal(found);
      } else {
        navigate('/app/proposals');
      }
    }
  }, [id, navigate]);

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    // Auto-advance to next step
    const currentIndex = workflowSteps.findIndex(step => step.id === stepId);
    if (currentIndex < workflowSteps.length - 1) {
      setCurrentStep(workflowSteps[currentIndex + 1].id);
    }
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: string) => currentStep === stepId;
  const isStepAccessible = (stepId: string) => {
    const stepIndex = workflowSteps.findIndex(step => step.id === stepId);
    const currentIndex = workflowSteps.findIndex(step => step.id === currentStep);
    return stepIndex <= currentIndex || isStepCompleted(stepId);
  };

  if (!proposal) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Proposal not found.</p>
          <Button onClick={() => navigate('/app/proposals')} className="mt-4">
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/app/proposals')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Proposals</span>
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{proposal.brokerName}</h1>
          <p className="text-muted-foreground">{proposal.insuranceType} • £{proposal.totalPremium.toLocaleString()}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Content */}
        
          {/* Progress Steps */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4 text-foreground">Application Progress</h2>
            <div className="flex flex-wrap gap-2">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const completed = isStepCompleted(step.id);
                const current = isStepCurrent(step.id);
                const accessible = isStepAccessible(step.id);
                
                return (
                  <Button
                    key={step.id}
                    variant={completed ? "default" : current ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 transition-all",
                      !accessible && "opacity-50 cursor-not-allowed",
                      completed && "bg-success hover:bg-success/90 text-success-foreground",
                      current && !completed && "border-primary"
                    )}
                    onClick={() => accessible && setCurrentStep(step.id)}
                    disabled={!accessible}
                  >
                    {completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Step Content */}
          <div className="min-h-[600px]">
            {currentStep === 'review' && (
              <ReviewProposal 
                proposal={proposal} 
                onContinue={() => setCurrentStep('customize')}
              />
            )}
            
            {currentStep === 'customize' && (
              <AdjustPlan 
                proposal={proposal} 
                onContinue={() => handleStepComplete('customize')}
              />
            )}
            
            {currentStep === 'kyc' && (
              <CreditIdentity 
                proposal={proposal} 
                onContinue={() => handleStepComplete('kyc')}
              />
            )}
            
            {currentStep === 'agreement' && (
              <DigitalAgreement 
                proposal={proposal} 
                onContinue={() => handleStepComplete('agreement')}
              />
            )}
            
            {currentStep === 'payment' && (
              <PaymentSetup 
                proposal={proposal} 
                onContinue={() => handleStepComplete('payment')}
                onBack={() => setCurrentStep('agreement')}
              />
            )}
            
            {currentStep === 'confirmation' && (
              <Confirmation 
                proposal={proposal} 
              />
            )}
            
            {currentStep !== 'review' && currentStep !== 'customize' && currentStep !== 'kyc' && currentStep !== 'agreement' && currentStep !== 'payment' && currentStep !== 'confirmation' && (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {workflowSteps.find(s => s.id === currentStep)?.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    This step is coming soon. For now, please review the proposal details.
                  </p>
                  <Button onClick={() => handleStepComplete(currentStep)} className="w-full">
                    Mark as Complete (Demo)
                  </Button>
                </div>
              </Card>
            )}
          </div>
        
      </div>
    </div>
  );
}