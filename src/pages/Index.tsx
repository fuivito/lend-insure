import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Shield, Clock, CheckCircle } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
              Premium Finance
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Spread the cost of your insurance premiums with flexible payment plans. 
              Trusted by thousands of customers and brokers across the UK.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={token ? `/start?token=${token}` : '/start'}>
                <Button className="btn-hero">
                  {token ? 'Continue Application' : 'Get Started'}
                </Button>
              </Link>
              <Link to="/app/dashboard">
                <Button variant="outline" className="btn-ghost-primary">
                  Customer Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="card-premium">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure & Regulated</CardTitle>
                <CardDescription>
                  FCA regulated with industry-leading security standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quick Approval</CardTitle>
                <CardDescription>
                  Get approved in minutes with our streamlined process
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium">
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Flexible Terms</CardTitle>
                <CardDescription>
                  Choose payment plans that work for your budget
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2024 LendInsure. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
