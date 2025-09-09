import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/badge";
import { mockBrokerStats, mockBrokerNotifications } from "@/lib/demo/brokerDashboard";
import { 
  FileCheck, 
  AlertTriangle, 
  FileX, 
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  agreement_signed: CheckCircle,
  payment_missed: XCircle,
  refund_raised: RefreshCw,
  policy_renewal: Calendar,
  client_inquiry: MessageCircle
};

const notificationColors = {
  agreement_signed: 'text-green-600',
  payment_missed: 'text-red-600',
  refund_raised: 'text-orange-600',
  policy_renewal: 'text-blue-600',
  client_inquiry: 'text-purple-600'
};

export default function BrokerDashboard() {
  const stats = mockBrokerStats;
  const notifications = mockBrokerNotifications;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Broker Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          <Bell className="w-4 h-4 mr-1" />
          {notifications.length} notifications
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Agreements"
          value={stats.activeAgreements.count}
          subtitle={`£${stats.activeAgreements.totalFinanced.toLocaleString()} financed`}
          icon={<FileCheck className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Defaults"
          value={`${stats.defaults.count} (${stats.defaults.percentage}%)`}
          subtitle="Out of active agreements"
          icon={<AlertTriangle className="h-6 w-6" />}
          variant="warning"
        />
        <StatCard
          title="Terminated Agreements"
          value={stats.terminatedAgreements.count}
          subtitle="This year"
          icon={<FileX className="h-6 w-6" />}
          variant="destructive"
        />
        <StatCard
          title="Revenue YTD"
          value={`£${stats.revenueYTD.toLocaleString()}`}
          subtitle="Year to date earnings"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Feed */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type];
              const iconColor = notificationColors[notification.type];
              
              return (
                <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {notification.message}
                    </p>
                    {notification.clientName && (
                      <p className="text-xs text-muted-foreground">
                        Client: {notification.clientName}
                        {notification.policyRef && ` • ${notification.policyRef}`}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Revenue Chart</p>
                <p className="text-xs">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}