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
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";

const DEFAULT_USERS: UserProfile[] = [
  {
    id: "user_citizen",
    name: "Alex Johnson",
    email: "citizen@civichero.org",
    role: "Citizen" as UserRole,
    points: 170,
    trustScore: 85,
    badges: ["Community Hero"],
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    reportsCount: 3,
    verifiedReports: 3,
    resolvedReports: 1,
    rank: 4
  },
  {
    id: "user_volunteer",
    name: "Samantha Green",
    email: "volunteer@civichero.org",
    role: "Volunteer" as UserRole,
    points: 450,
    trustScore: 98,
    badges: ["Top Verifier", "Neighborhood Guardian"],
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    reportsCount: 8,
    verifiedReports: 12,
    resolvedReports: 4,
    rank: 1
  },
  {
    id: "user_officer",
    name: "Chief Officer Marcus",
    email: "officer@civichero.org",
    role: "Department Officer" as UserRole,
    points: 150,
    trustScore: 100,
    badges: ["Problem Solver"],
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
    reportsCount: 0,
    verifiedReports: 15,
    resolvedReports: 12,
    rank: 3
  },
  {
    id: "user_admin",
    name: "Elena Rostova",
    email: "admin@civichero.org",
    role: "Administrator" as UserRole,
    points: 200,
    trustScore: 100,
    badges: ["Problem Solver", "Community Hero"],
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    reportsCount: 1,
    verifiedReports: 20,
    resolvedReports: 18,
    rank: 2
  }
];

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [rewardsHistory, setRewardsHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [reportLocation, setReportLocation] = useState<LocationData | null>(null);

  // Sync state on change of user
  useEffect(() => {
    if (currentUser) {
      fetchIssues();
      fetchNotifications();
      fetchRewards();
      fetchStats();
      fetchLeaderboard();
    }
  }, [currentUser]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch("/api/issues");
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${currentUser?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch(`/api/rewards?userId=${currentUser?.id}`);
      if (response.ok) {
        const data = await response.json();
        setRewardsHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: newRole };
    handleLogin(updatedUser);
  };

  const handleVoteIssue = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id })
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
          userId: currentUser.id,
          userName: currentUser.name,
          status
        })
      });
      if (response.ok) {
        fetchIssues();
        fetchNotifications();
        fetchRewards();
        fetchStats();
        fetchLeaderboard();
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
        fetchNotifications();
        fetchRewards();
        fetchStats();
        fetchLeaderboard();
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
        body: JSON.stringify({ userId: currentUser?.id })
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
    fetchNotifications();
    fetchRewards();
    fetchStats();
    fetchLeaderboard();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (activeTab === "profile") {
    return <ProfilePage user={currentUser} onUpdate={handleUpdateUser} onBack={() => setActiveTab("dashboard")} />;
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
          onLogout={handleLogout}
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
            leaderboardData={leaderboard}
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
