import { useState } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  Check, 
  AlertOctagon, 
  X, 
  Activity, 
  Compass,
  Award,
  Lock
} from "lucide-react";
import { CivicIssue, UserProfile } from "../types";

interface VerificationPanelProps {
  issues: CivicIssue[];
  currentUser: UserProfile;
  onVerifyIssue: (issueId: string, status: string) => void;
}

export default function VerificationPanel({
  issues,
  currentUser,
  onVerifyIssue
}: VerificationPanelProps) {
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  // Issues that need verification (status is reported or verified, and the user hasn't voted on it yet)
  const pendingIssues = issues.filter(issue => {
    return issue.status === "reported" && issue.reporterId !== currentUser.id;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-teal-100 text-teal-700 border-teal-200";
    }
  };

  const currentWeight = Math.max(1, Math.floor(currentUser.trustScore / 10));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" id="verification-panel">
      
      {/* Intro Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/15 animate-pulse">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Community <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">Verification Workshop</span>
        </h1>
        <p className="text-slate-600 text-sm max-w-md">
          Verify and audit nearby incidents to validate public reports. Your trust profile awards you a voting weight of <span className="text-teal-600 font-bold">{currentWeight}</span>.
        </p>
      </div>

      {/* Role Restriction Warning */}
      {currentUser.role !== "Volunteer" && currentUser.role !== "Citizen" && currentUser.role !== "Administrator" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs mb-6 text-amber-800">
          <Lock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Officer / Admin View Mode</p>
            <p className="mt-0.5">Please switch your profile to **Volunteer** or **Citizen** in the top-right persona dropdown to submit active verification votes and claim rewards.</p>
          </div>
        </div>
      )}

      {pendingIssues.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md mx-auto">
          <Check className="h-10 w-10 text-emerald-500 bg-emerald-50 rounded-full p-2 mx-auto mb-3 animate-bounce" />
          <h4 className="text-sm font-bold text-slate-800">No Incidents Awaiting Audit</h4>
          <p className="text-xs text-slate-500 mt-1">
            Excellent! All reported complaints in this sector are currently verified or assigned. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* List Column */}
          <div className="md:col-span-1 space-y-2">
            <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 px-1">Audits Pending ({pendingIssues.length})</p>
            <div className="space-y-2 overflow-y-auto max-h-[450px] pr-1">
              {pendingIssues.map(issue => (
                <button
                  key={issue.id}
                  onClick={() => setActiveIssueId(issue.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                    activeIssueId === issue.id 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">Conf: {issue.confidenceScore}%</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-snug line-clamp-1">{issue.title}</h4>
                    <p className="text-[10px] opacity-75 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> {issue.location.address?.split(",")[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Detail Column */}
          <div className="md:col-span-2">
            {activeIssueId ? (
              (() => {
                const activeIssue = pendingIssues.find(i => i.id === activeIssueId);
                if (!activeIssue) return null;
                return (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-200">
                    
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img src={activeIssue.image} alt={activeIssue.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-lg text-[9px] font-mono uppercase tracking-wider">
                        {activeIssue.category}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">{activeIssue.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{activeIssue.description}</p>
                    </div>

                    <div className="flex gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{activeIssue.location.address}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Lat: {activeIssue.location.latitude.toFixed(5)}, Lng: {activeIssue.location.longitude.toFixed(5)}</p>
                      </div>
                    </div>

                    {/* AI telemetry summary */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px] font-mono tracking-wider uppercase">Auto Dimension</p>
                        <p className="font-semibold text-slate-100 mt-0.5">{activeIssue.estimatedSize || "Survey required"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-mono tracking-wider uppercase">Routed Agency</p>
                        <p className="font-semibold text-teal-400 mt-0.5">{activeIssue.suggestedDepartment}</p>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Activity className="h-4 w-4 text-rose-500" />
                        <span>Select Your Verification Response:</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => {
                            onVerifyIssue(activeIssue.id, "verified");
                            setActiveIssueId(null);
                          }}
                          disabled={currentUser.role === "Department Officer"}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold text-center transition-colors flex flex-col items-center justify-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Valid Report</span>
                        </button>
                        <button
                          onClick={() => {
                            onVerifyIssue(activeIssue.id, "already_fixed");
                            setActiveIssueId(null);
                          }}
                          disabled={currentUser.role === "Department Officer"}
                          className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold text-center transition-colors flex flex-col items-center justify-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Already Fixed</span>
                        </button>
                        <button
                          onClick={() => {
                            onVerifyIssue(activeIssue.id, "false_report");
                            setActiveIssueId(null);
                          }}
                          disabled={currentUser.role === "Department Officer"}
                          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-bold text-center transition-colors flex flex-col items-center justify-center gap-1"
                        >
                          <AlertOctagon className="h-4 w-4" />
                          <span>False Report</span>
                        </button>
                        <button
                          onClick={() => {
                            onVerifyIssue(activeIssue.id, "need_evidence");
                            setActiveIssueId(null);
                          }}
                          disabled={currentUser.role === "Department Officer"}
                          className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 p-2.5 rounded-xl text-xs font-bold text-center transition-colors flex flex-col items-center justify-center gap-1 border border-slate-200"
                        >
                          <X className="h-4 w-4" />
                          <span>Need Proof</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-amber-50/50 p-2.5 border border-amber-100 text-[10px] text-amber-800 font-semibold leading-normal">
                        <Award className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Validating this incident awards you 50 gamification points and updates the sector's public hazard confidence quotient!</span>
                      </div>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
                <Compass className="h-10 w-10 text-slate-400 mb-2 animate-spin-slow" />
                <h4 className="text-xs font-bold text-slate-600">No Incident Selected</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                  Select a pending audit from the left sidebar panel to initiate physical ground-truth verification analysis.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
