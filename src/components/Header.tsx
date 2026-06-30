import { useState } from "react";
import { 
  ShieldAlert, 
  User, 
  Bell, 
  MapPin, 
  Trophy, 
  Cpu, 
  BarChart3, 
  MessageSquare, 
  PlusCircle, 
  Home, 
  CheckSquare,
  ShieldCheck,
  ChevronDown,
  Gift,
  Wrench
} from "lucide-react";
import { UserProfile, UserRole } from "../types";

interface HeaderProps {
  currentUser: UserProfile;
  onChangeRole: (newRole: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notificationCount: number;
  onLogout: () => void;
}

export default function Header({ 
  currentUser, 
  onChangeRole, 
  activeTab, 
  setActiveTab,
  notificationCount,
  onLogout
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getAllowedTabs = () => {
    const role = currentUser.role;
    const base = [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "map", label: "Interactive Map", icon: MapPin },
      { id: "report", label: "Report Issue", icon: PlusCircle, highlight: true },
      { id: "leaderboard", label: "Leaderboard", icon: Trophy },
      { id: "rewards", label: "Rewards", icon: Gift },
      { id: "chat", label: "AI Chatbot", icon: MessageSquare },
    ];
    if (role === "Volunteer" || role === "Department Officer" || role === "Administrator") {
      base.push({ id: "verify", label: "Verify Issues", icon: CheckSquare });
    }
    if (role === "Department Officer" || role === "Administrator") {
      base.push({ id: "admin", label: "Admin Panel", icon: Wrench });
    }
    if (role === "Administrator") {
      base.push({ id: "predictions", label: "AI Predictions", icon: Cpu });
      base.push({ id: "analytics", label: "Analytics", icon: BarChart3 });
    }
    return base;
  };

  const tabs = getAllowedTabs();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E0E0E0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4285F4] text-white shadow-sm">
            <ShieldCheck className="h-5.5 w-5.5" id="logo-icon" />
          </div>
          <div>
            <span className="font-sans text-lg font-bold tracking-tight text-[#202124]">
              CivicHero <span className="text-[#4285F4]">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] font-mono tracking-wider uppercase text-[#5F6368] font-semibold leading-none">
              Autonomous Agent Platform
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  tab.highlight
                    ? "bg-[#4285F4] text-white shadow-sm hover:bg-[#1967D2]"
                    : isActive
                    ? "bg-[#E8F0FE] text-[#1967D2]"
                    : "text-[#5F6368] hover:bg-gray-100 hover:text-[#202124]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: User Info and Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Trigger */}
          <button 
            id="notif-btn"
            onClick={() => setActiveTab("notifications")}
            className={`relative rounded-md p-2 text-[#5F6368] hover:bg-gray-100 hover:text-[#202124] transition-colors ${
              activeTab === "notifications" ? "bg-gray-100 text-[#202124]" : ""
            }`}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#EA4335] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Interactive User Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-lg border border-[#E0E0E0] bg-white p-1.5 pr-3 hover:bg-gray-50 transition-colors"
            >
              <img 
                src={currentUser.photo} 
                alt={currentUser.name} 
                className="h-7 w-7 rounded-md object-cover ring-2 ring-[#4285F4]/15"
              />
              <ChevronDown className="h-4 w-4 text-[#5F6368]" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#E0E0E0] bg-white p-2 shadow-lg z-50">
                <button onClick={() => { setActiveTab("profile"); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-gray-50">My Profile</button>
                <button onClick={onLogout} className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Sign Out</button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Navigation (Mobile Drawer/Row) */}
      <div className="flex lg:hidden border-t border-gray-100 overflow-x-auto bg-gray-50 scrollbar-none px-2 py-1.5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                tab.highlight
                  ? "bg-[#4285F4] text-white"
                  : isActive
                  ? "bg-white text-[#202124] shadow-sm border border-gray-100"
                  : "text-[#5F6368] hover:bg-gray-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
