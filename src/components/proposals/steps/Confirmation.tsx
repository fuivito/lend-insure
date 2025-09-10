import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Proposal } from '@/types/proposals';
import { CheckCircle, Download, FileText, Calendar, Mail } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ConfirmationProps {
  proposal: Proposal;
}

export function Confirmation({ proposal }: ConfirmationProps) {
  const navigate = useNavigate();
  const [emailReminders, setEmailReminders] = useState(true);
  const [calendarReminder, setCalendarReminder] = useState(false);

  const totalRepayable = proposal.terms.totalRepayable;
  const firstCollectionDate = addMonths(new Date(), 1);

  // Generate next 3 instalments for mini schedule
  const nextInstalments = Array.from({ length: 3 }, (_, i) => {
    const dueDate = addMonths(new Date(), i + 1);
    const amount = proposal.customSchedule 
      ? proposal.customSchedule[i]?.amount || proposal.terms.suggestedPlan.monthlyAmount
      : proposal.terms.suggestedPlan.monthlyAmount;
    
    return {
      number: i + 1,
      dueDate,
      amount
    };
  });

  const handleDownloadAgreement = () => {
    // Placeholder for PDF download
    console.log('Downloading Credit Agreement PDF...');
    // In real implementation, this would trigger a PDF download
  };

  const handleDownloadSchedule = (format: 'pdf' | 'csv') => {
    // Placeholder for schedule download
    console.log(`Downloading Payment Schedule ${format.toUpperCase()}...`);
    // In real implementation, this would trigger file download
  };

  const handleCalendarReminder = () => {
    if (calendarReminder) {
      // Generate .ics file content
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lendinsure//Financing Reminders//EN
BEGIN:VEVENT
UID:financing-reminder-${proposal.id}@lendinsure.com
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${format(firstCollectionDate, "yyyyMMdd'T'090000'Z'")}
SUMMARY:Insurance Financing Payment Due
DESCRIPTION:Payment due for ${proposal.brokerName} - ${proposal.insuranceType}
RRULE:FREQ=MONTHLY;COUNT=${proposal.terms.suggestedPlan.instalments}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Payment reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

      // Create and download .ics file
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financing-reminders-${proposal.id}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            ✅ Financing Active
          </h2>
          <p className="text-muted-foreground">
            Your insurance financing has been successfully set up
          </p>
        </div>

        {/* Financial Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Financing Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                £{totalRepayable.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Repayable</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {format(firstCollectionDate, 'dd MMM')}
              </div>
              <div className="text-sm text-muted-foreground">First Collection</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {proposal.terms.suggestedPlan.instalments}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Payments</div>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Mini Schedule */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Next 3 Instalments</h3>
          <div className="space-y-3">
            {nextInstalments.map((instalment) => (
              <div key={instalment.number} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {instalment.number}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {format(instalment.dueDate, 'dd MMMM yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Instalment {instalment.number}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  £{instalment.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Downloads */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Downloads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadAgreement}
              className="flex items-center space-x-2 h-auto p-4"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Signed Credit Agreement</div>
                <div className="text-sm text-muted-foreground">PDF Document</div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleDownloadSchedule('pdf')}
                className="flex items-center space-x-2 h-auto p-4 w-full"
              >
                <Calendar className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Payment Schedule</div>
                  <div className="text-sm text-muted-foreground">PDF Document</div>
                </div>
                <Download className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleDownloadSchedule('csv')}
                className="flex items-center space-x-2 h-auto p-4 w-full"
              >
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Payment Schedule</div>
                  <div className="text-sm text-muted-foreground">CSV Spreadsheet</div>
                </div>
                <Download className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Reminder Toggles */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Reminders</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-reminders" className="font-medium">
                    Email Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified 3 days before each payment
                  </p>
                </div>
              </div>
              <Switch
                id="email-reminders"
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="calendar-reminder" className="font-medium">
                    Calendar Reminder
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Download .ics file for your calendar app
                  </p>
                </div>
              </div>
              <Switch
                id="calendar-reminder"
                checked={calendarReminder}
                onCheckedChange={(checked) => {
                  setCalendarReminder(checked);
                  if (checked) {
                    handleCalendarReminder();
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/app')}
            size="lg"
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}