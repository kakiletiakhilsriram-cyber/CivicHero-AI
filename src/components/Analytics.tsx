import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  BarChart3, 
  Activity, 
  CheckCircle, 
  Clock, 
  Users 
} from "lucide-react";

interface AnalyticsProps {
  stats: {
    totalReports: number;
    solvedCount: number;
    pendingCount: number;
    averageResolutionDays: number;
    deptDistribution: { name: string; count: number }[];
    categoryDistribution: { name: string; count: number }[];
    participationRate: number;
  };
}

export default function Analytics({ stats }: AnalyticsProps) {
  
  // Custom theme colors matching our sleek teal palette
  const COLORS = ["#0d9488", "#0284c7", "#6366f1", "#475569", "#8b5cf6", "#ec4899"];

  // Monthly trends mock data
  const trendData = [
    { month: "Jan", complaints: 14, resolved: 10 },
    { month: "Feb", complaints: 22, resolved: 18 },
    { month: "Mar", complaints: 35, resolved: 24 },
    { month: "Apr", complaints: 28, resolved: 22 },
    { month: "May", complaints: 45, resolved: 38 },
    { month: "Jun", complaints: stats.totalReports + 10, resolved: stats.solvedCount },
  ];

  // Map backend stats department distribution if empty
  const barData = stats.deptDistribution && stats.deptDistribution.length > 0 
    ? stats.deptDistribution 
    : [
        { name: "Roads Dept", count: 8 },
        { name: "Municipality", count: 12 },
        { name: "Water Board", count: 5 },
        { name: "Forest Dept", count: 4 },
        { name: "Sewer Dept", count: 3 },
      ];

  const pieData = stats.categoryDistribution && stats.categoryDistribution.length > 0
    ? stats.categoryDistribution
    : [
        { name: "Road Damage", count: 12 },
        { name: "Garbage", count: 15 },
        { name: "Water Leakage", count: 6 },
        { name: "Tree Fallen", count: 4 },
        { name: "Drainage", count: 3 },
      ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="analytics-page">
      
      {/* Intro Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Sector <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Impact Dashboard</span>
        </h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Public auditing charts detailing response efficiency, local resolution indices, and community mobilization ratios.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 leading-none">Complaints Logged</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.totalReports}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 leading-none">Resolved Cases</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.solvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 leading-none">Average Fix Velocity</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.averageResolutionDays} Days</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 leading-none">Participation Rate</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.participationRate}%</p>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Monthly Incidents Trend (Line/Area Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 h-96">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sector Trend Analytics</h3>
            <p className="text-[11px] text-slate-500">Historical comparison between reported and resolved cases monthly</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="complaints" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" name="Issues Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" name="Issues Fixed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Issue Categories Distribution (Pie Chart) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 h-96">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Category Density</h3>
            <p className="text-[11px] text-slate-500">Proportional load of civic complaints</p>
          </div>
          <div className="flex-1 w-full text-xs relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Issues`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom overlay text in donut */}
            <div className="absolute text-center">
              <p className="text-xl font-black text-slate-800 leading-none">{stats.totalReports}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</p>
            </div>
          </div>
          
          {/* Legend indicator list */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-50 text-[10px]">
            {pieData.map((d, index) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-600 truncate font-medium">{d.name}: {d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Department workload counts (Bar Chart) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 h-96">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Agency Task Allocations</h3>
            <p className="text-[11px] text-slate-500">Distribution of active workload and repair assignments by public department</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Legend iconType="circle" />
                <Bar dataKey="count" fill="#0d9488" radius={[8, 8, 0, 0]} name="Assigned Incidents" maxBarSize={45}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
