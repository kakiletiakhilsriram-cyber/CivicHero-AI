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
  ChevronDown
} from "lucide-react";
import { UserProfile, UserRole } from "../types";

interface HeaderProps {
  currentUser: UserProfile;
  onChangeRole: (newRole: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notificationCount: number;
}

export default function Header({ 
  currentUser, 
  onChangeRole, 
  activeTab, 
  setActiveTab,
  notificationCount 
}: HeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roles: UserRole[] = ["Citizen", "Volunteer", "Department Officer", "Administrator"];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "map", label: "Interactive Map", icon: MapPin },
    { id: "report", label: "Report Issue", icon: PlusCircle, highlight: true },
    { id: "verify", label: "Verify Issues", icon: CheckSquare },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "predictions", label: "AI Predictions", icon: Cpu },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "chat", label: "AI Chatbot", icon: MessageSquare },
  ];

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
              id="role-dropdown-btn"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 rounded-lg border border-[#E0E0E0] bg-white p-1.5 pr-3 hover:bg-gray-50 transition-colors"
            >
              <img 
                src={currentUser.photo} 
                alt={currentUser.name} 
                className="h-7 w-7 rounded-md object-cover ring-2 ring-[#4285F4]/15"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#202124] leading-tight">{currentUser.name}</p>
                <p className="text-[10px] font-medium text-[#1967D2]">{currentUser.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[#5F6368]" />
            </button>

            {/* Dropdown Menu */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[#E0E0E0] bg-white p-2 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-mono tracking-wider uppercase text-[#5F6368]">Switch Persona (Tester Tool)</p>
                  <p className="text-xs text-[#5F6368]">Cycle roles to test advanced dashboards</p>
                </div>
                <div className="mt-1 space-y-0.5">
                  {roles.map((r) => (
                    <button
                      key={r}
                      id={`role-opt-${r.toLowerCase().replace(" ", "-")}`}
                      onClick={() => {
                        onChangeRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                        currentUser.role === r 
                          ? "bg-[#E8F0FE] text-[#1967D2]" 
                          : "text-[#5F6368] hover:bg-gray-50 hover:text-[#202124]"
                      }`}
                    >
                      <span>{r}</span>
                      {currentUser.role === r && <ShieldCheck className="h-4 w-4 text-[#1967D2]" />}
                    </button>
                  ))}
                </div>
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
