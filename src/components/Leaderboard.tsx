import { Trophy, Medal, Search, Star, Zap, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";

interface LeaderboardProps {
  currentUser: UserProfile;
  leaderboardData: UserProfile[];
}

export default function Leaderboard({ currentUser, leaderboardData }: LeaderboardProps) {
  const sortedUsers = [...leaderboardData].sort((a, b) => b.points - a.points);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-amber-500 fill-amber-100" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400 fill-slate-100" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700 fill-amber-50" />;
    return <span className="text-xs font-bold text-slate-500 w-5 text-center">{rank}</span>;
  };

  const badgeDescriptions: Record<string, string> = {
    "Community Hero": "Awarded for reporting a high-impact, valid civic issue that is successfully repaired.",
    "Neighborhood Guardian": "Unlocked by completing over 10 independent verification audits near your GPS sectors.",
    "Top Verifier": "Earned by achieving a community trust confidence score of 95% or higher.",
    "Problem Solver": "Awarded directly by municipal department officers for helping clear neighborhood hazards."
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" id="leaderboard-page">
      
      {/* Intro Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
          <Trophy className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Civic Hero <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Leaderboard</span>
        </h1>
        <p className="text-slate-600 text-sm max-w-md">
          Earn points by helping analyze, report, and verify local hazards. Secure badges to elevate your community trust weight!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Current User Rank Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <p className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold uppercase">Your Civic Profile</p>
            
            <div className="flex items-center gap-3 mt-4">
              <img src={currentUser.photo} alt={currentUser.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500/20" />
              <div>
                <h3 className="font-bold text-sm text-slate-100">{currentUser.name}</h3>
                <p className="text-xs text-slate-400">Trust Score: <span className="text-emerald-400 font-semibold">{currentUser.trustScore}%</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-white/10 text-center">
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400">Total Points</p>
                <p className="text-xl font-bold text-slate-100">{currentUser.points}</p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[10px] text-slate-400">Your Rank</p>
                <p className="text-xl font-bold text-emerald-400">#{currentUser.rank}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-1.5 justify-center">
              <span className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                Role: {currentUser.role}
              </span>
            </div>

          </div>

          {/* Badges explanation panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-100" />
              Unlockable Badges
            </h4>
            <div className="space-y-2.5">
              {Object.entries(badgeDescriptions).map(([badge, desc]) => {
                const hasBadge = currentUser.badges.includes(badge);
                return (
                  <div key={badge} className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    hasBadge ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${hasBadge ? "text-emerald-800" : "text-slate-700"}`}>{badge}</span>
                      {hasBadge ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Locked</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: High contributors table list */}
        <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800">Top Civic Contributors</h3>
              <p className="text-xs text-slate-500">Live points index updated across our municipal sector</p>
            </div>
            <div className="flex gap-1.5">
              <span className="bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-lg text-xs">Sector Overall</span>
            </div>
          </div>

          <div className="space-y-2">
            {sortedUsers.map((user, idx) => {
              const isMe = user.id === currentUser.id;
              const rank = idx + 1;
              return (
                <div 
                  key={user.id}
                  id={`contributor-row-${user.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                    isMe 
                      ? "bg-teal-50/50 border-teal-200 shadow-sm" 
                      : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 flex justify-center">
                      {getRankIcon(rank)}
                    </div>
                    
                    <img src={user.photo} alt={user.name} className="h-9 w-9 rounded-lg object-cover ring-2 ring-slate-200/50" />
                    
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isMe && <span className="text-[9px] font-mono font-bold bg-teal-600 text-white px-1.5 py-0.5 rounded uppercase">You</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span className="font-semibold text-teal-600">{user.role}</span>
                        <span>•</span>
                        <span>Reports: {user.reportsCount}</span>
                        <span>•</span>
                        <span>Trust Weight: {Math.floor(user.trustScore/10)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-slate-800">{user.points} PTS</p>
                      <p className="text-[9px] font-semibold text-slate-400 capitalize">{user.badges[0] || "Novice Hero"}</p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-emerald-500 fill-emerald-100" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
