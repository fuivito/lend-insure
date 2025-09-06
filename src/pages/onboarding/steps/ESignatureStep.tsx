import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PenTool, 
  CheckCircle, 
  FileText, 
  Clock,
  MapPin,
  Wifi,
  RotateCcw,
  Trash2,
  Type
} from 'lucide-react';

interface ESignatureStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  completed: boolean;
}

export function ESignatureStep({ data, onUpdate, onComplete, completed }: ESignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [secci, setSecci] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timestamp] = useState(new Date().toLocaleString());
  const [ipAddress] = useState('192.168.1.1'); // Mock IP
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');

  useEffect(() => {
    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e40af';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    
    setIsSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setIsSigned(false);
    setTypedSignature('');
  };

  const undoLastStroke = () => {
    // In a real implementation, this would undo the last stroke
    // For now, we'll just clear the signature
    clearSignature();
  };

  const applyTypedSignature = () => {
    if (!typedSignature.trim()) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '32px cursive';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2 + 10);
        setIsSigned(true);
      }
    }
  };

  const canComplete = termsAccepted && secci && (isSigned || (signatureType === 'type' && typedSignature.trim()));

  const handleSubmit = () => {
    if (canComplete) {
      const signatureData = {
        signed: true,
        timestamp: new Date().toISOString(),
        ipAddress,
        signatureType,
        signatureData: signatureType === 'type' ? typedSignature : 'canvas_signature'
      };
      
      onUpdate({ signature: signatureData });
      onComplete();
    }
  };

  return (
    <div className="space-y-6" data-testid="esignature-step">
      <div className="text-center mb-8">
        <PenTool className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Digital Signature & Final Agreements</h2>
        <p className="text-muted-foreground">
          Complete your application by signing the credit agreement electronically
        </p>
      </div>

      {/* Important Disclosures */}
      <Card className="border-warning/20 bg-warning-light/50">
        <CardHeader>
          <CardTitle className="text-warning">Important Cost Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-warning/90 space-y-3">
            <div className="p-3 bg-background rounded border-l-4 border-l-warning">
              <p className="font-semibold mb-1">Monthly payments usually cost more than paying annually</p>
              <p>
                Total amount payable: <strong>£1,140</strong> vs Premium amount: <strong>£1,200</strong><br />
                Interest charges: <strong>£140</strong> at <strong>15.9% APR</strong>
              </p>
            </div>
            
            <div>
              <p className="font-semibold mb-1">Credit Provider: Premium Finance Ltd</p>
              <p className="text-xs">
                Authorised and regulated by the Financial Conduct Authority. Registration: 123456
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Pad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Electronic Signature
          </CardTitle>
          <CardDescription>
            Please sign below to complete your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as 'draw' | 'type')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Draw Signature
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2" data-testid="type-signature-tab">
                <Type className="h-4 w-4" />
                Type Signature
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="draw" className="mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border rounded cursor-crosshair bg-background"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Sign above using your mouse or touch
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={undoLastStroke}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Undo
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSignature}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="type" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="typed-signature">Type your full name</Label>
                  <Input
                    id="typed-signature"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="John Doe"
                    className="text-lg"
                  />
                </div>
                <div className="border rounded-lg p-4 bg-background min-h-[100px] flex items-center justify-center">
                  {typedSignature ? (
                    <span style={{ fontFamily: 'cursive', fontSize: '24px' }}>
                      {typedSignature}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Your signature will appear here</span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={applyTypedSignature}
                  disabled={!typedSignature.trim()}
                >
                  Apply Signature
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Certification Block */}
      <Card className="border-primary/20 bg-primary-light/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Signature Certification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Timestamp</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {timestamp}
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">IP Address</div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                {ipAddress}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Your signature, timestamp, and IP address are recorded for security and legal compliance purposes.
          </div>
        </CardContent>
      </Card>

      {/* Legal Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Agreements</CardTitle>
          <CardDescription>
            Please review and accept the following agreements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                I accept the Terms and Conditions *
              </label>
              <p className="text-sm text-muted-foreground">
                I have read, understood and agree to be bound by the{' '}
                <a href="/legal/terms" className="text-primary hover:underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/legal/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="secci"
              checked={secci}
              onCheckedChange={(checked) => setSecci(checked === true)}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="secci" className="text-sm font-medium cursor-pointer">
                I acknowledge receipt of SECCI document *
              </label>
              <p className="text-sm text-muted-foreground">
                I confirm I have received and read the{' '}
                <a href="/legal/secci" className="text-primary hover:underline">
                  Standard European Consumer Credit Information (SECCI)
                </a>{' '}
                document which contains important information about this credit agreement.
              </p>
            </div>
          </div>
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
            Please complete signature and accept all agreements to finish
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
          Credit is subject to status and affordability checks. You have 14 days to withdraw.
        </p>
      </div>
    </div>
  );
}