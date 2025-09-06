import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Shield,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { mockDocuments } from '@/lib/fixtures';

const documentTypeIcons = {
  agreement: FileText,
  secci: Shield,
  schedule: Calendar,
  mandate: FileText,
  kyc: Shield
};

const documentTypeNames = {
  agreement: 'Credit Agreement',
  secci: 'SECCI Information',
  schedule: 'Payment Schedule',
  mandate: 'Direct Debit Mandate',
  kyc: 'Identity Verification'
};

export default function Documents() {
  const handleDownload = (doc: typeof mockDocuments[0]) => {
    // Mock download functionality
    console.log('Downloading:', doc.name);
  };

  const handleView = (doc: typeof mockDocuments[0]) => {
    // Mock view functionality - would open PDF viewer
    console.log('Viewing:', doc.name);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Documents & Agreements
        </h1>
        <p className="text-muted-foreground">
          Access and download all your premium finance documents
        </p>
      </div>

      {/* Document Categories */}
      <div className="grid gap-6">
        {/* Essential Documents */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Essential Documents
            </CardTitle>
            <CardDescription>
              Your main credit agreement and regulatory information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockDocuments.filter(doc => ['agreement', 'secci'].includes(doc.type)).map((doc) => {
                const IconComponent = documentTypeIcons[doc.type];
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {documentTypeNames[doc.type]} • Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(doc)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Documents */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Documents
            </CardTitle>
            <CardDescription>
              Payment schedules and Direct Debit mandates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockDocuments.filter(doc => ['schedule', 'mandate'].includes(doc.type)).map((doc) => {
                const IconComponent = documentTypeIcons[doc.type];
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {documentTypeNames[doc.type]} • Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(doc)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-primary/20 bg-primary-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Document Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-primary mb-2">Secure Storage</h4>
                <p className="text-sm text-primary/80">
                  All documents are encrypted and stored securely in compliance with data protection regulations.
                  Your personal information is protected with bank-level security.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-primary mb-2">24/7 Access</h4>
                <p className="text-sm text-primary/80">
                  Your documents are available to download at any time. We recommend saving copies 
                  for your records, especially your credit agreement.
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-primary/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-primary">Need a paper copy?</h4>
                  <p className="text-sm text-primary/80">
                    We can post printed versions of any document to your registered address.
                  </p>
                </div>
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                  Request Paper Copies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Information */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Regulatory Information</CardTitle>
            <CardDescription>
              Important regulatory and compliance information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Credit Provider</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Premium Finance Ltd</strong><br />
                  Authorised and regulated by the Financial Conduct Authority<br />
                  FCA Registration: 123456
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View FCA Register
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Rights</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You have important rights under the Consumer Credit Act 1974. 
                  Information about your rights and how to make a complaint is included in your documents.
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Consumer Rights Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}