import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  PenTool, 
  CheckCircle, 
  FileText,
  Calendar,
  MapPin,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface ESignatureStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

export function ESignatureStep({ data, onUpdate, onComplete, completed }: ESignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [disclosuresAccepted, setDisclosuresAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e40af';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = () => {
    if (hasSigned && disclosuresAccepted && termsAccepted) {
      const signatureData = {
        signed: true,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.1' // Mock IP
      };
      
      onUpdate({ signature: signatureData });
      onComplete();
    }
  };

  const canComplete = hasSigned && disclosuresAccepted && termsAccepted;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <PenTool className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Digital Signature</h2>
        <p className="text-muted-foreground">
          Complete your application by signing the credit agreement electronically
        </p>
      </div>

      {/* Signature Details */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Details</CardTitle>
          <CardDescription>
            Your electronic signature will be legally binding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleString('en-GB')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-muted-foreground">
                  IP: 192.168.1.1 (Mock)
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-success" />
              <div>
                <div className="font-medium">Secure & Verified</div>
                <div className="text-sm text-muted-foreground">
                  Your signature is encrypted and tamper-proof
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Disclosures */}
      <Card className="border-warning/20 bg-warning-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Important Disclosures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-warning/90 space-y-3">
            <div>
              <h4 className="font-semibold mb-1">Cost of Credit</h4>
              <p>
                Paying monthly usually costs more than paying annually upfront. 
                The total amount payable is £1,140 compared to the premium of £1,200, 
                representing £140 in interest charges at 15.9% APR.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Credit Provider</h4>
              <p>
                Credit is provided by <strong>Premium Finance Ltd</strong>, 
                authorised and regulated by the Financial Conduct Authority. 
                Registration number: 123456.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Your Rights</h4>
              <p>
                You have the right to withdraw from this agreement within 14 days. 
                You can settle early at any time, which may reduce the total amount payable.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="disclosures"
              checked={disclosuresAccepted}
              onCheckedChange={(checked) => setDisclosuresAccepted(checked === true)}
            />
            <label htmlFor="disclosures" className="text-sm cursor-pointer">
              I acknowledge that I have read and understood the important disclosures above, 
              including the cost of credit and my rights under this agreement.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Agreement Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              By signing below, you agree to be bound by the terms and conditions of the:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Credit Agreement with Premium Finance Ltd</li>
              <li>Direct Debit Mandate for automatic payments</li>
              <li>Privacy Policy and Data Processing terms</li>
              <li>LendInsure Platform Terms of Service</li>
            </ul>
            <p className="mt-3">
              All documents are available for download after completion and have been 
              provided to you during this application process.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the terms and conditions of the credit agreement and 
              associated documents listed above.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Signature Pad */}
      <Card>
        <CardHeader>
          <CardTitle>Electronic Signature</CardTitle>
          <CardDescription>
            Sign your name in the box below using your mouse or finger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full h-32 border border-border rounded bg-background cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Sign above
              </span>
              <Button variant="outline" size="sm" onClick={clearSignature}>
                Clear
              </Button>
            </div>
          </div>

          {hasSigned && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Signature captured</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Application */}
      <div className="text-center">
        <Button 
          onClick={handleSubmit}
          disabled={!canComplete}
          className={canComplete ? 'btn-success text-lg py-6 px-8' : 'text-lg py-6 px-8'}
        >
          {completed ? 'Application Completed' : 'Complete Application'}
          <CheckCircle className="ml-2 h-5 w-5" />
        </Button>
        
        {!canComplete && (
          <p className="text-sm text-muted-foreground mt-2">
            Please complete all sections above to finish your application
          </p>
        )}
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
        <p className="mb-2">
          <strong>Legal Notice:</strong> Your electronic signature has the same legal effect as a handwritten signature. 
          By signing electronically, you consent to conduct this transaction by electronic means.
        </p>
        <p>
          This agreement is governed by the laws of England and Wales. 
          Any disputes will be subject to the exclusive jurisdiction of the English courts.
        </p>
      </div>
    </div>
  );
}