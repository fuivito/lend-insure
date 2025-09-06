import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart,
  Shield,
  Search
} from 'lucide-react';

const faqs = [
  {
    id: 'payment-dates',
    question: 'When are my payments due?',
    answer: 'Your payments are due on the 15th of each month. You can see all upcoming payment dates in your payment schedule document or on your dashboard.'
  },
  {
    id: 'change-payment',
    question: 'Can I change my payment date?',
    answer: 'You may be able to change your payment date, subject to approval. Please contact our customer service team who can discuss your options.'
  },
  {
    id: 'early-settlement',
    question: 'Can I pay off my plan early?',
    answer: 'Yes, you can settle your plan early at any time. Early settlement may reduce the total amount you pay. Contact us for a settlement quote.'
  },
  {
    id: 'missed-payment',
    question: 'What happens if I miss a payment?',
    answer: 'If you miss a payment, we\'ll contact you to arrange payment. Late payment fees may apply. Contact us immediately if you\'re struggling to keep up with payments.'
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: 'We primarily collect payments by Direct Debit. If you need to make a one-off payment, you can pay by debit card through your online account.'
  },
  {
    id: 'credit-score',
    question: 'Will this affect my credit score?',
    answer: 'We perform a soft credit check when you apply, which doesn\'t affect your credit score. Your payment history with us may be reported to credit agencies.'
  }
];

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    console.log('Contact form submitted:', contactForm);
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Support & Help
        </h1>
        <p className="text-muted-foreground">
          Get help with your premium finance plan and find answers to common questions
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Search FAQ */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Help Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find quick answers to the most common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try searching for different terms or contact our support team.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vulnerability Support */}
          <Card className="border-warning/20 bg-warning-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-warning" />
                Need Extra Support?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-warning/90">
                If you're struggling financially or need additional support, we're here to help. 
                We offer various options for customers facing difficulties.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2">Payment Holidays</h4>
                  <p className="text-sm text-warning/80 mb-3">
                    Temporary breaks from payments during difficult times
                  </p>
                  <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10">
                    Learn More
                  </Button>
                </div>
                
                <div className="p-4 bg-white/50 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2">Payment Plans</h4>
                  <p className="text-sm text-warning/80 mb-3">
                    Adjusted payment schedules to help manage your budget
                  </p>
                  <Button variant="outline" size="sm" className="border-warning/20 text-warning hover:bg-warning/10">
                    Get Help
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-warning/20">
                <p className="text-sm text-warning/80 mb-3">
                  <strong>Remember:</strong> The earlier you contact us about difficulties, 
                  the more options we may have available to help you.
                </p>
                <Button className="bg-warning text-warning-foreground hover:bg-warning/90">
                  Contact Support Team
                  <Phone className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="What can we help you with?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please provide details about your query..."
                    rows={5}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Send Message
                  <MessageCircle className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Methods */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Phone Support</div>
                  <div className="text-sm text-muted-foreground">0800 123 4567</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-muted-foreground">help@lendinsure.com</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Live Chat</div>
                  <div className="text-sm text-muted-foreground">Available 9am-5pm</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="font-medium">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
              
              <div className="pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Currently Open</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Support */}
          <Card className="border-destructive/20 bg-destructive-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive/90 mb-3">
                If you're in financial difficulty or facing an emergency, 
                call our dedicated support line immediately.
              </p>
              <Button variant="destructive" className="w-full">
                Emergency Line: 0800 911 999
              </Button>
            </CardContent>
          </Card>

          {/* Regulatory Info */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Regulatory Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Premium Finance Ltd is authorised and regulated by the Financial Conduct Authority.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View FCA Registration
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Make a Complaint
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}