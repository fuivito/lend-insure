import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  PieChart, 
  Briefcase, 
  Settings,
  BarChart3,
  FileText,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function BrokerComingSoon() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
          Broker Portal
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          A comprehensive platform for brokers to manage clients, build deals, and track performance
        </p>
        <Badge variant="outline" className="status-warning text-lg px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      {/* Preview Features */}
      <div className="grid gap-8 mb-12">
        {/* Client Management */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Comprehensive client relationship management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Features Preview:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Complete client database with search and filters</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Application status tracking and history</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Communication logs and document sharing</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Automated follow-up reminders</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Mock Client Table</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-background rounded text-sm">
                    <span>John Smith</span>
                    <Badge variant="outline" className="status-success">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded text-sm">
                    <span>Sarah Johnson</span>
                    <Badge variant="outline" className="status-warning">Pending</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background rounded text-sm">
                    <span>Mike Wilson</span>
                    <Badge variant="outline" className="status-success">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Builder */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Deal Builder</CardTitle>
                <CardDescription>Interactive tool for creating and pricing premium finance deals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Features Preview:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Real-time APR calculator with adjustable rates</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Commission and revenue split visualization</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Multiple payment schedule options</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Instant quote generation and client sharing</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-3">APR Calculator Preview</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Premium Amount</span>
                    <span className="font-medium">£1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">APR Rate</span>
                    <span className="font-medium">15.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Broker Commission</span>
                    <span className="font-medium text-success">£45</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Monthly Payment</span>
                      <span className="font-bold">£114</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Management */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Pipeline Management</CardTitle>
                <CardDescription>Visual pipeline to track deals from quote to completion</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Features Preview:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Drag-and-drop kanban board interface</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Deal stage tracking and progression alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Commission forecasting and reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Performance analytics and conversion rates</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-3">Pipeline Stages</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-background p-2 rounded text-center">
                    <div className="font-medium">Quoted</div>
                    <div className="text-muted-foreground">3 deals</div>
                  </div>
                  <div className="bg-background p-2 rounded text-center">
                    <div className="font-medium">Applied</div>
                    <div className="text-muted-foreground">2 deals</div>
                  </div>
                  <div className="bg-background p-2 rounded text-center">
                    <div className="font-medium">Approved</div>
                    <div className="text-muted-foreground">1 deal</div>
                  </div>
                  <div className="bg-background p-2 rounded text-center">
                    <div className="font-medium">Complete</div>
                    <div className="text-muted-foreground">5 deals</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Generator */}
        <Card className="card-premium">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Document Generator</CardTitle>
                <CardDescription>One-click generation of quotes, applications, and agreements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Features Preview:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Branded quote templates with your logo</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Pre-filled application forms</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Automated document email delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Digital signature integration</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-3">Available Templates</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-background rounded">
                    <span className="text-sm">Premium Finance Quote</span>
                    <Button size="sm" variant="outline" disabled>Generate</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-background rounded">
                    <span className="text-sm">Application Form</span>
                    <Button size="sm" variant="outline" disabled>Generate</Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-background rounded">
                    <span className="text-sm">Credit Agreement</span>
                    <Button size="sm" variant="outline" disabled>Generate</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Launch Timeline */}
      <Card className="border-primary/20 bg-primary-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            Development Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Q2 2024</h4>
              <p className="text-sm text-primary/80">
                Beta release with core client management and deal builder features
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Q3 2024</h4>
              <p className="text-sm text-primary/80">
                Full analytics dashboard and advanced reporting capabilities
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-primary mb-2">Q4 2024</h4>
              <p className="text-sm text-primary/80">
                API integrations and white-label customization options
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <h2 className="font-heading text-2xl font-bold mb-4">
          Interested in Early Access?
        </h2>
        <p className="text-muted-foreground mb-6">
          Join our beta program to get early access to the Broker Portal and help shape its development.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="btn-hero">
            Join Beta Program
          </Button>
          <Button variant="outline">
            Request Demo
          </Button>
        </div>
      </div>
    </div>
  );
}