import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Clock,
  TrendingUp,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const data = [
  { name: 'Mon', apps: 400, interviews: 240 },
  { name: 'Tue', apps: 300, interviews: 139 },
  { name: 'Wed', apps: 200, interviews: 980 },
  { name: 'Thu', apps: 278, interviews: 390 },
  { name: 'Fri', apps: 189, interviews: 480 },
  { name: 'Sat', apps: 239, interviews: 380 },
  { name: 'Sun', apps: 349, interviews: 430 },
];

export default function Dashboard() {
  const stats = [
    { name: "Total Applications", value: "2,543", icon: Users, change: "+12.5%", positive: true },
    { name: "Active Jobs", value: "48", icon: Briefcase, change: "+3", positive: true },
    { name: "Interviews Today", value: "12", icon: Clock, change: "-2", positive: false },
    { name: "Hired this Month", value: "85", icon: UserCheck, change: "+18%", positive: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back, here's what's happening with your recruitment funnel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs flex items-center gap-1 mt-1">
                {stat.positive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.positive ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span className="text-muted-foreground">from last week</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e4" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#fff", border: "1px solid #e5e5e4", borderRadius: "8px" }}
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                />
                <Bar dataKey="apps" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill="#737373" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "LinkedIn", value: 124, color: "bg-blue-500" },
                { name: "Indeed", value: 89, color: "bg-blue-400" },
                { name: "Direct", value: 56, color: "bg-zinc-800" },
                { name: "Internal", value: 34, color: "bg-green-500" },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color}`} 
                      style={{ width: `${(item.value / 150) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
