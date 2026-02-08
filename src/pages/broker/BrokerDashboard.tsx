import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrokerDashboard } from "@/hooks/useBrokerDashboard";
import {
  Users,
  FileText,
  FilePen,
  Send,
  FileCheck,
  PoundSterling,
  Plus,
  ArrowRight,
  UserPlus,
  Mail,
  MessageCircle,
  Bell
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const formatCurrency = (pennies: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pennies / 100);
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PROPOSED: 'bg-blue-100 text-blue-700',
  SIGNED: 'bg-purple-100 text-purple-700',
  ACTIVE: 'bg-green-100 text-green-700',
  DEFAULTED: 'bg-red-100 text-red-700',
  TERMINATED: 'bg-gray-100 text-gray-700',
};

const CHART_COLORS = {
  DRAFT: '#64748b',
  PROPOSED: '#3b82f6',
  SIGNED: '#a855f7',
  ACTIVE: '#22c55e',
};

const getDaysColor = (days: number) => {
  if (days <= 2) return 'text-green-600 bg-green-50';
  if (days <= 5) return 'text-yellow-600 bg-yellow-50';
  if (days <= 7) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

const getDaysBadgeColor = (days: number) => {
  if (days <= 2) return 'bg-green-100 text-green-700 border-green-200';
  if (days <= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (days <= 7) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

export default function BrokerDashboard() {
  const navigate = useNavigate();
  const { stats, isLoading, error } = useBrokerDashboard();

  const handleSendReminder = (type: 'email' | 'whatsapp', agreement: any) => {
    if (type === 'email' && agreement.client_email) {
      window.location.href = `mailto:${agreement.client_email}?subject=Reminder: Your Insurance Finance Proposal&body=Hi ${agreement.client_name.split(' ')[0]},%0D%0A%0D%0AJust a friendly reminder about your insurance finance proposal of ${formatCurrency(agreement.principal_amount_pennies)}.%0D%0A%0D%0APlease let us know if you have any questions.`;
    } else if (type === 'whatsapp' && agreement.client_phone) {
      const phone = agreement.client_phone.replace(/\s+/g, '').replace(/^\+/, '');
      const message = encodeURIComponent(`Hi ${agreement.client_name.split(' ')[0]}, just a friendly reminder about your insurance finance proposal of ${formatCurrency(agreement.principal_amount_pennies)}. Let us know if you have any questions!`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 mx-4 md:mx-6 lg:mx-8 space-y-10 max-w-7xl mx-auto">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Loading your overview…</p>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 mx-4 md:mx-6 lg:mx-8 space-y-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground text-center">Dashboard</h1>
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-sm">
          <CardContent className="p-8">
            <p className="text-destructive text-center">Error loading dashboard: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare chart data
  const chartData = [
    { name: 'Draft', value: stats.draft_agreements, color: CHART_COLORS.DRAFT },
    { name: 'Proposed', value: stats.proposed_agreements, color: CHART_COLORS.PROPOSED },
    { name: 'Signed', value: stats.signed_agreements, color: CHART_COLORS.SIGNED },
    { name: 'Active', value: stats.active_agreements, color: CHART_COLORS.ACTIVE },
  ].filter(item => item.value > 0);

  const hasAgreements = stats.total_agreements > 0;

  // Bar chart: latest agreements by value (from recent_agreements)
  const latestByValueData = stats.recent_agreements
    .map((a) => ({
      name: a.client_name.split(' ').map((s) => s[0]).join('') || '—',
      fullName: a.client_name,
      value: a.principal_amount_pennies / 100,
      valuePennies: a.principal_amount_pennies,
    }))
    .reverse();

  return (
    <div className="p-6 md:p-8 mx-4 md:mx-6 lg:mx-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Here’s your overview.</p>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 h-12 text-sm font-medium rounded-xl border-border/80 hover:bg-muted/50"
          onClick={() => navigate('/app/broker/clients/new')}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
        <Button
          size="lg"
          className="flex-1 h-12 text-sm font-medium rounded-xl shadow-sm"
          onClick={() => navigate('/app/broker/agreements/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Agreement
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        <Card
          className="cursor-pointer rounded-2xl border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          onClick={() => navigate('/app/broker/clients')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clients</p>
                <p className="text-2xl font-semibold mt-1 tabular-nums">{stats.total_clients}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          onClick={() => navigate('/app/broker/agreements?status=DRAFT')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drafts</p>
                <p className="text-2xl font-semibold mt-1 tabular-nums">{stats.draft_agreements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                <FilePen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          onClick={() => navigate('/app/broker/agreements?status=PROPOSED')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proposed</p>
                <p className="text-2xl font-semibold mt-1 tabular-nums">{stats.proposed_agreements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          onClick={() => navigate('/app/broker/agreements?status=ACTIVE')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="text-2xl font-semibold mt-1 tabular-nums">{stats.active_agreements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer rounded-2xl border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          onClick={() => navigate('/app/broker/agreements')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-semibold mt-1 tabular-nums">{stats.total_agreements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/8 to-primary/4 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Financed</p>
                <p className="text-xl font-semibold mt-1 tabular-nums">{formatCurrency(stats.total_financed_pennies)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <PoundSterling className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization row: donut + bar chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agreements by Status (donut) */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Agreements by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {hasAgreements ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, 'Agreements']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No agreements yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest agreements by value (bar chart) */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Latest by value</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Most recent agreements, by amount</p>
          </CardHeader>
          <CardContent>
            {latestByValueData.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={latestByValueData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis type="number" tickFormatter={(v) => `£${v}`} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="category" dataKey="name" width={32} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      formatter={(value: number, _name: string, item: { payload?: { fullName: string; valuePennies: number } }) => {
                        const p = item?.payload;
                        const amount = p?.valuePennies ?? Math.round(value * 100);
                        const label = p?.fullName ?? '';
                        return [formatCurrency(amount), label];
                      }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                      labelFormatter={() => ''}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No recent agreements
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Awaiting Response */}
      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="h-4 w-4" />
                Awaiting Response
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7"
                onClick={() => navigate('/app/broker/agreements?status=PROPOSED')}
              >
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.proposed_agreements_list.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No proposals awaiting response</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.proposed_agreements_list.slice(0, 5).map((agreement) => {
                  const daysSinceSent = agreement.created_at
                    ? differenceInDays(new Date(), new Date(agreement.created_at))
                    : 0;

                  return (
                    <div
                      key={agreement.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                        onClick={() => navigate(`/app/broker/agreements/${agreement.id}`)}
                      >
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{agreement.client_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(agreement.principal_amount_pennies)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDaysBadgeColor(daysSinceSent)}`}
                        >
                          {daysSinceSent === 0 ? 'Today' : daysSinceSent === 1 ? '1 day' : `${daysSinceSent} days`}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Bell className="h-3.5 w-3.5 mr-1" />
                              Remind
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleSendReminder('email', agreement)}
                              disabled={!agreement.client_email}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleSendReminder('whatsapp', agreement)}
                              disabled={!agreement.client_phone}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Agreements */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Agreements</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-7 hover:text-foreground"
              onClick={() => navigate('/app/broker/agreements')}
            >
              View all
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recent_agreements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No agreements yet</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {stats.recent_agreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/broker/agreements/${agreement.id}`)}
                >
                  <div className="h-8 w-8 rounded-lg bg-muted/80 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{agreement.client_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(agreement.principal_amount_pennies)}
                      </span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[agreement.status]}`}>
                        {agreement.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
