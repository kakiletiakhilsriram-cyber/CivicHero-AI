import { useState } from "react";
import { 
  Lock, 
  Wrench, 
  CheckCircle, 
  FileSpreadsheet, 
  FileText, 
  UserCheck, 
  Cpu, 
  Clock, 
  Layers, 
  CheckSquare,
  ClipboardList
} from "lucide-react";
import { CivicIssue, IssueStatus, UserProfile } from "../types";

interface AdminPanelProps {
  issues: CivicIssue[];
  currentUser: UserProfile;
  onUpdateIssueStatus: (issueId: string, status: IssueStatus, remarks: string, officer: string, media?: string) => void;
}

export default function AdminPanel({
  issues,
  currentUser,
  onUpdateIssueStatus
}: AdminPanelProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [officerName, setOfficerName] = useState(currentUser.name);
  const [exportSuccess, setExportSuccess] = useState("");

  const isEligible = 
    currentUser.role === "Department Officer" || 
    currentUser.role === "Administrator" || 
    currentUser.role === "Super Admin";

  const handleStatusChange = (status: IssueStatus) => {
    if (!selectedIssueId) return;
    const notes = remarks || `Status transitioned to '${status.replace("_", " ")}' by Department Officer.`;
    
    // Default mock final resolution photo if resolving
    let mockMedia = undefined;
    if (status === "resolved") {
      mockMedia = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&h=500&q=80";
    }

    onUpdateIssueStatus(selectedIssueId, status, notes, officerName, mockMedia);
    setRemarks("");
    setSelectedIssueId(null);
  };

  const activeIssue = issues.find(i => i.id === selectedIssueId);

  // Simulated exports
  const triggerExport = (type: "CSV" | "PDF") => {
    setExportSuccess(`Successfully synthesized and exported full Sector Incident Ledger to ${type}!`);
    setTimeout(() => setExportSuccess(""), 4000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" id="admin-panel-page">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <ClipboardList className="h-5.5 w-5.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Municipal Command Center</h1>
            <p className="text-slate-500 text-xs">Direct repair dispatches, agency logs audits, and ledger exports</p>
          </div>
        </div>

        {isEligible && (
          <div className="flex gap-2">
            <button
              onClick={() => triggerExport("CSV")}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => triggerExport("PDF")}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileText className="h-4 w-4 text-rose-600" />
              <span>Export PDF</span>
            </button>
          </div>
        )}
      </div>

      {exportSuccess && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-bounce">
          {exportSuccess}
        </div>
      )}

      {/* Role Restriction Mask */}
      {!isEligible ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-md mx-auto space-y-4">
          <Lock className="h-12 w-12 text-slate-400 mx-auto" />
          <div>
            <h3 className="font-display text-base font-bold text-slate-800">Command Center Masked</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You are currently logged in as **Alex Johnson (Citizen)**. Only registered Municipal Department Officers, Admins, or Super Admins can dispatch repair units.
            </p>
          </div>
          <div className="bg-teal-50 border border-teal-100 p-3 rounded-2xl">
            <p className="text-[11px] font-semibold text-teal-800 leading-snug">
              💡 Tester Action: Use the top-right role switcher to choose "Department Officer" or "Administrator" to instantly unlock this complete panel!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Worklist column */}
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-teal-600" />
                Active Incidents Worklist
              </h3>
              <span className="text-xs font-mono text-slate-500">{issues.length} Tickets logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {issues.map(issue => (
                    <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-800 max-w-[200px] truncate">{issue.title}</td>
                      <td className="text-slate-600 font-semibold">{issue.category}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          issue.severity === "critical" ? "bg-red-100 text-red-700" : issue.severity === "high" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
                        }`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td>
                        <span className="capitalize text-slate-700">{issue.status.replace("_", " ")}</span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px]"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Incident Control Panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
            
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="h-4.5 w-4.5 text-teal-600" />
                Dispatch Console
              </h3>
            </div>

            {activeIssue ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Selected Ticket</p>
                  <p className="text-xs font-bold text-slate-800 leading-snug">{activeIssue.title}</p>
                  <p className="text-[10px] text-slate-500">Suggested Dept: <span className="font-semibold text-teal-600">{activeIssue.suggestedDepartment}</span></p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Officer / Assignee</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                    placeholder="Enter assignee or team name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Dispatch Remarks / Log Notes</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full text-xs text-slate-600 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-teal-500"
                    placeholder="Provide logistics remarks or crew dispatch schedules..."
                  />
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Execute Phase Transition:</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange("assigned")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1 border border-slate-200"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Assign Agency</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange("in_progress")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Start Repairs</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleStatusChange("resolved")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Resolve Incident (+100 PTS)</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-24 text-center space-y-2 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4">
                <Wrench className="h-10 w-10 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-600">No dispatch target active</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Select "Manage" on any incident in the left worklist to open the command dispatch terminal.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
