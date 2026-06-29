import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Cpu, 
  Wrench, 
  CheckCircle, 
  Gift, 
  Users, 
  ArrowRight,
  Shield,
  Activity,
  UserCheck
} from "lucide-react";
import { UserProfile, CivicIssue, UserRole, LocationData } from "./types";
import Header from "./components/Header";
import ReportIssue from "./components/ReportIssue";
import InteractiveMap from "./components/InteractiveMap";
import Leaderboard from "./components/Leaderboard";
import Rewards from "./components/Rewards";
import Analytics from "./components/Analytics";
import Predictions from "./components/Predictions";
import AIChat from "./components/AIChat";
import Notifications from "./components/Notifications";
import AdminPanel from "./components/AdminPanel";
import VerificationPanel from "./components/VerificationPanel";

const DEFAULT_USERS: UserProfile[] = [
  {
    id: "user_citizen",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Citizen" as UserRole,
    points: 180,
    trustScore: 85,
    badges: ["Community Hero"],
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    reportsCount: 4,
    verifiedReports: 2,
    resolvedReports: 1,
    rank: 12
  },
  {
    id: "user_volunteer",
    name: "Samantha Miller",
    email: "samantha@example.com",
    role: "Volunteer" as UserRole,
    points: 420,
    trustScore: 98,
    badges: ["Neighborhood Guardian", "Top Verifier"],
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    reportsCount: 8,
    verifiedReports: 12,
    resolvedReports: 5,
    rank: 3
  },
  {
    id: "user_officer",
    name: "Officer Chief Marcus",
    email: "marcus@example.com",
    role: "Department Officer" as UserRole,
    points: 1200,
    trustScore: 100,
    badges: ["Problem Solver"],
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100&q=80",
    reportsCount: 15,
    verifiedReports: 45,
    resolvedReports: 30,
    rank: 1
  },
  {
    id: "user_admin",
    name: "Supervisor Daniel Craig",
    email: "daniel@example.com",
    role: "Administrator" as UserRole,
    points: 2150,
    trustScore: 100,
    badges: ["Problem Solver", "Community Hero"],
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
    reportsCount: 22,
    verifiedReports: 94,
    resolvedReports: 78,
    rank: 1
  }
];

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("user_citizen");
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [rewardsHistory, setRewardsHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [reportLocation, setReportLocation] = useState<LocationData | null>(null);

  // Sync state on change of selected user profile (Role)
  useEffect(() => {
    fetchProfile();
    fetchIssues();
    fetchNotifications();
    fetchRewards();
    fetchStats();
  }, [selectedUserId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/auth/profile?userId=${selectedUserId}`);
      const data = await response.json();
      setCurrentUser(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch("/api/issues");
      const data = await response.json();
      setIssues(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${selectedUserId}`);
      const data = await response.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch(`/api/rewards?userId=${selectedUserId}`);
      const data = await response.json();
      setRewardsHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    let targetUserId = "user_citizen";
    if (newRole === "Volunteer") targetUserId = "user_volunteer";
    else if (newRole === "Department Officer") targetUserId = "user_officer";
    else if (newRole === "Administrator" || newRole === "Super Admin") targetUserId = "user_admin";

    try {
      const response = await fetch("/api/auth/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, newRole })
      });
      if (response.ok) {
        setSelectedUserId(targetUserId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoteIssue = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId })
      });
      if (response.ok) {
        fetchIssues();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyIssue = async (issueId: string, status: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/issues/${issueId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          userName: currentUser.name,
          status
        })
      });
      if (response.ok) {
        fetchIssues();
        fetchProfile();
        fetchNotifications();
        fetchRewards();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateIssueStatus = async (
    issueId: string, 
    status: string, 
    remarks: string, 
    officer: string, 
    media?: string
  ) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks, officer, media })
      });
      if (response.ok) {
        fetchIssues();
        fetchProfile();
        fetchNotifications();
        fetchRewards();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId })
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetReportLocation = (lat: number, lng: number, address: string) => {
    setReportLocation({ latitude: lat, longitude: lng, address });
    setActiveTab("report");
  };

  const handleIssueCreated = () => {
    fetchIssues();
    fetchProfile();
    fetchNotifications();
    fetchRewards();
    fetchStats();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (activeTab === "landing") {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between" id="landing-screen">
        
        {/* Navigation row */}
        <div className="mx-auto max-w-7xl w-full px-6 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4285F4] text-white shadow-sm">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <span className="font-sans text-lg font-bold text-[#202124]">
              CivicHero <span className="text-[#4285F4]">AI</span>
            </span>
          </div>
          <button
            onClick={() => setActiveTab("dashboard")}
            className="bg-[#4285F4] hover:bg-[#1967D2] text-white text-xs font-bold px-4 py-2.5 rounded-md transition-all shadow-sm"
          >
            Launch Platform
          </button>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto space-y-8 py-12">
          
          <div className="inline-flex items-center gap-1 bg-[#E8F0FE] border border-[#D2E3FC] text-[#1967D2] rounded-full px-3 py-1 text-[11px] font-bold font-mono tracking-wider uppercase animate-pulse">
            <Sparkles className="h-3 w-3 text-amber-500 fill-amber-300" />
            Google AI Studio Hackathon Core Entry
          </div>

          <div className="space-y-4">
            <h1 className="font-sans text-4xl sm:text-6xl font-black tracking-tight text-[#202124] leading-none">
              AI-Powered Hyperlocal <br />
              <span className="bg-gradient-to-r from-[#4285F4] to-[#1967D2] bg-clip-text text-transparent">
                Community Problem Solver
              </span>
            </h1>
            <p className="text-[#5F6368] text-base max-w-2xl mx-auto leading-relaxed">
              Transform standard complaint filing into an autonomous agent workflow. CivicHero AI combines Gemini vision diagnostics, geographical duplicate checking, trust audits, and predictive public analytics in a single secure dashboard.
            </p>
          </div>

          {/* Quick-onboard User Selection buttons */}
          <div className="space-y-3 w-full max-w-xl">
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#5F6368]">Select an Onboarding Persona to Enter:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setSelectedUserId("user_citizen");
                  setActiveTab("dashboard");
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#E0E0E0] bg-white hover:border-[#4285F4] hover:shadow-sm text-left transition-all group"
              >
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-[#202124] group-hover:text-[#1967D2]">Alex (Citizen)</p>
                  <p className="text-[10px] text-[#5F6368] font-medium">Create reports</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedUserId("user_volunteer");
                  setActiveTab("dashboard");
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#E0E0E0] bg-white hover:border-[#4285F4] hover:shadow-sm text-left transition-all group"
              >
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-[#202124] group-hover:text-[#1967D2]">Samantha (Volunteer)</p>
                  <p className="text-[10px] text-[#5F6368] font-medium">Audit verifications</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedUserId("user_officer");
                  setActiveTab("dashboard");
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#E0E0E0] bg-white hover:border-[#4285F4] hover:shadow-sm text-left transition-all group"
              >
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100&q=80" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-bold text-[#202124] group-hover:text-[#1967D2]">Marcus (Officer)</p>
                  <p className="text-[10px] text-[#5F6368] font-medium">Dispatch repairs</p>
                </div>
              </button>
            </div>
          </div>

          {/* Core Pipeline Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-gray-200">
            <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-[#E0E0E0] shadow-sm text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1967D2] mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-[#202124]">1. Gemini Vision</p>
              <p className="text-[10px] text-[#5F6368] mt-1 leading-snug">Extracts category, size, risks, and department routing.</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-[#E0E0E0] shadow-sm text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-2">
                <Cpu className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-[#202124]">2. Duplicate Sweep</p>
              <p className="text-[10px] text-[#5F6368] mt-1 leading-snug">Autonomous radius search within 150m to avoid repeat files.</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-[#E0E0E0] shadow-sm text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 mb-2">
                <Shield className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-[#202124]">3. Crowd Audits</p>
              <p className="text-[10px] text-[#5F6368] mt-1 leading-snug">Geolocated citizens vote to verify and escalate reports.</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-[#E0E0E0] shadow-sm text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 mb-2">
                <Gift className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-[#202124]">4. Hero Gamify</p>
              <p className="text-[10px] text-[#5F6368] mt-1 leading-snug">Earn progressive point levels and claim badged rewards.</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="py-6 border-t border-gray-100 shrink-0 text-center text-[10px] font-mono text-[#5F6368]">
          CIVICHERO AI • DESIGNED IN DEEPMIND WORKSPACE • POWERED BY GEMINI 3.5 FLASH
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      
      {/* Universal Header */}
      {currentUser && (
        <Header 
          currentUser={currentUser} 
          onChangeRole={handleRoleChange} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          notificationCount={unreadCount}
        />
      )}

      {/* Main View Port */}
      <main className="flex-1">
        
        {activeTab === "dashboard" && currentUser && (
          <div className="mx-auto max-w-7xl px-4 py-8 space-y-8" id="dashboard-tab-view">
            
            {/* Quick Hero Indicator */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E0E0E0] p-5 rounded-xl shadow-sm">
              <div className="space-y-1">
                <h2 className="font-sans text-xl font-bold text-[#202124]">Welcome, {currentUser.name}!</h2>
                <p className="text-[#5F6368] text-xs">
                  Logged in as <span className="text-[#1967D2] font-semibold">{currentUser.role}</span>. You have reported **{currentUser.reportsCount} issues** and verified **{currentUser.verifiedReports} cases**.
                </p>
              </div>

              {/* Citizen Stats */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("rewards")}
                  className="bg-white border border-[#E0E0E0] p-3 rounded-lg text-left cursor-pointer hover:shadow-sm transition-all"
                >
                  <p className="text-[9px] font-mono font-bold tracking-wider uppercase text-[#5F6368] leading-none">Your Reward points</p>
                  <p className="text-lg font-mono font-bold text-[#188038] mt-1">{currentUser.points} PTS</p>
                </button>
                <button
                  onClick={() => setActiveTab("report")}
                  className="bg-[#4285F4] hover:bg-[#1967D2] text-white px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-amber-400 fill-current" />
                  <span>Report New Incident</span>
                </button>
              </div>
            </div>

            {/* Quick Map and Activities grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Recent Issues Activity feed */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-sans text-sm font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-[#4285F4]" />
                    Live Incident Activity
                  </h3>
                  <button 
                    onClick={() => setActiveTab("map")}
                    className="text-xs font-bold text-[#1967D2] hover:text-[#1557B0] flex items-center gap-1"
                  >
                    <span>View Map Ledger</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                  {issues.map(issue => (
                    <div 
                      key={issue.id}
                      className="p-3.5 rounded-lg border border-gray-100 bg-white flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <img src={issue.image} className="h-12 w-12 rounded-lg object-cover border border-gray-100 shrink-0" />
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                            issue.severity === "critical" ? "bg-[#FCE8E6] text-[#C5221F]" : issue.severity === "high" ? "bg-[#FEEFC3] text-[#B06000]" : "bg-[#E6F4EA] text-[#137333]"
                          }`}>
                            {issue.severity}
                          </span>
                          <h4 className="text-xs font-bold text-[#202124] mt-1 leading-snug line-clamp-1">{issue.title}</h4>
                          <p className="text-[10px] text-[#5F6368] mt-0.5 leading-relaxed line-clamp-2">{issue.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-[9px] font-semibold text-[#5F6368]">
                            <span className="text-[#1967D2] font-bold">{issue.category}</span>
                            <span>•</span>
                            <span className="capitalize">{issue.status}</span>
                            <span>•</span>
                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 bg-white border border-[#E0E0E0] px-2 py-1 rounded-md text-[10px] font-bold text-[#5F6368]">
                          👍 {issue.votes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Column: Mini profile / Officer tools quick launches */}
              <div className="space-y-6">
                
                {/* AI Predictive insights box */}
                <div className="bg-[#202124] text-white p-5 rounded-xl shadow-md space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#4285F4]/20 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-4.5 w-4.5 text-[#4285F4] animate-pulse" />
                    <span className="text-[10px] font-mono tracking-wider text-gray-300 font-bold uppercase">Predictive AI Agent</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 leading-snug">Sector Vulnerability Scanned</h4>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      Haight St is displaying elevated pipeline fatigue. Scanning ongoing.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("predictions")}
                    className="w-full bg-white hover:bg-gray-100 text-[#202124] text-xs font-bold py-2 rounded-md text-center transition-colors"
                  >
                    View Predictions & Audits
                  </button>
                </div>

                {/* Direct Command Switchers for testers */}
                <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-[#4285F4]" />
                    Municipal Dispatch Workspace
                  </h4>
                  <p className="text-[11px] text-[#5F6368] leading-relaxed">
                    Access roles control: dispatch repair units, view command dashboard, or trigger point awards.
                  </p>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className="w-full bg-[#4285F4] hover:bg-[#1967D2] text-white text-xs font-bold py-2 rounded-md text-center transition-colors"
                  >
                    Open Dispatch Terminal
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Map View */}
        {activeTab === "map" && currentUser && (
          <InteractiveMap 
            issues={issues} 
            currentUser={currentUser}
            onSelectIssue={() => {}} 
            onSetReportLocation={handleSetReportLocation}
            onVoteIssue={handleVoteIssue}
            onVerifyIssue={handleVerifyIssue}
          />
        )}

        {/* Report form */}
        {activeTab === "report" && currentUser && (
          <ReportIssue 
            currentUser={currentUser} 
            initialLocation={reportLocation} 
            onIssueCreated={handleIssueCreated}
            onSetActiveTab={setActiveTab}
          />
        )}

        {/* Verification lists */}
        {activeTab === "verify" && currentUser && (
          <VerificationPanel 
            issues={issues} 
            currentUser={currentUser}
            onVerifyIssue={handleVerifyIssue}
          />
        )}

        {/* Leaderboard */}
        {activeTab === "leaderboard" && currentUser && (
          <Leaderboard 
            currentUser={currentUser} 
            leaderboardData={issues.reduce((acc: any[], curr) => {
              // Standard simulated leaders
              return acc;
            }, [...DEFAULT_USERS])} // fallback seed
          />
        )}

        {/* Rewards progress logs */}
        {activeTab === "rewards" && currentUser && (
          <Rewards 
            currentUser={currentUser} 
            rewardsHistory={rewardsHistory}
          />
        )}

        {/* Analytics charts */}
        {activeTab === "analytics" && stats && (
          <Analytics stats={stats} />
        )}

        {/* Predictions AI table */}
        {activeTab === "predictions" && (
          <Predictions onSetActiveTab={setActiveTab} />
        )}

        {/* Chat assistant bubble */}
        {activeTab === "chat" && currentUser && (
          <AIChat currentUser={currentUser} />
        )}

        {/* System Activity Feed notifications */}
        {activeTab === "notifications" && (
          <Notifications 
            notifications={notifications} 
            onMarkAllRead={handleMarkAllNotificationsRead} 
          />
        )}

        {/* Officer dispatch room */}
        {activeTab === "admin" && currentUser && (
          <AdminPanel 
            issues={issues} 
            currentUser={currentUser} 
            onUpdateIssueStatus={handleUpdateIssueStatus} 
          />
        )}

      </main>
    </div>
  );
}
