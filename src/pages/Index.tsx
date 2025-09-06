import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Building, Shield, Clock, CheckCircle, ChevronDown, Menu } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-foreground">LendInsure</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link to="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link to="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/app/dashboard">
                <Button variant="outline" size="sm">Customer Login</Button>
              </Link>
              <Link to="/app/broker">
                <Button size="sm">Broker Login</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="flex flex-col space-y-3">
                    <Link to="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                    <Link to="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                    <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link>
                  </div>
                  <div className="border-t pt-6 flex flex-col space-y-3">
                    <Link to="/app/dashboard">
                      <Button variant="outline" className="w-full">Customer Login</Button>
                    </Link>
                    <Link to="/app/broker">
                      <Button className="w-full">Broker Login</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-muted-foreground mb-4 tracking-wide uppercase">LendInsure</p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Insure Now.
              <span className="block text-primary">Pay Later.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-prose mx-auto mb-12">
              Spread the cost of your insurance premiums with flexible monthly payments. 
              Simple, transparent, and secure premium finance solutions.
            </p>
            
            {/* Scroll affordance */}
            <div className="animate-bounce">
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto" />
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="rounded-2xl p-6 shadow-sm">
              <CardHeader className="p-0">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure & Regulated</CardTitle>
                <CardDescription>
                  FCA regulated with industry-leading security standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl p-6 shadow-sm">
              <CardHeader className="p-0">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quick Approval</CardTitle>
                <CardDescription>
                  Get approved in minutes with our streamlined process
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl p-6 shadow-sm">
              <CardHeader className="p-0">
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
