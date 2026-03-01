import { useDashboardAnalytics } from "@/hooks/use-analytics";
import { Layout } from "@/components/layout";
import { 
  Send, 
  MailOpen, 
  MousePointerClick, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const COLORS = ['hsl(238, 100%, 65%)', 'hsl(270, 100%, 60%)', 'hsl(190, 100%, 50%)', 'hsl(320, 100%, 60%)'];

function StatCard({ title, value, icon: Icon, trend, colorClass }: any) {
  return (
    <div className="glass-panel rounded-2xl p-6 hover-elevate">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="font-display text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 border border-current/20`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: analytics, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Fallback data if API returns empty
  const defaultAnalytics = {
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    failed: 0,
    deviceStats: [{ name: "Desktop", value: 65 }, { name: "Mobile", value: 35 }],
    countryStats: [
      { name: "US", value: 400 },
      { name: "UK", value: 300 },
      { name: "DE", value: 200 },
      { name: "CA", value: 100 }
    ]
  };

  const data = analytics || defaultAnalytics;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Analytics Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg">Real-time performance metrics across all campaigns.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Sent" 
            value={data.totalSent.toLocaleString()} 
            icon={Send} 
            colorClass="bg-blue-500 text-blue-400" 
          />
          <StatCard 
            title="Avg. Open Rate" 
            value={`${data.openRate.toFixed(1)}%`} 
            icon={MailOpen} 
            colorClass="bg-indigo-500 text-indigo-400" 
          />
          <StatCard 
            title="Avg. Click Rate" 
            value={`${data.clickRate.toFixed(1)}%`} 
            icon={MousePointerClick} 
            colorClass="bg-purple-500 text-purple-400" 
          />
          <StatCard 
            title="Failed/Bounced" 
            value={data.failed.toLocaleString()} 
            icon={AlertTriangle} 
            colorClass="bg-rose-500 text-rose-400" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 lg:col-span-1">
            <h3 className="font-display text-lg font-semibold mb-6">Device Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.deviceStats.length ? data.deviceStats : defaultAnalytics.deviceStats}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {data.deviceStats.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold mb-6">Top Countries</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data.countryStats.length ? data.countryStats : defaultAnalytics.countryStats}>
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
