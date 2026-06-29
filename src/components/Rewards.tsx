import { Gift, Award, Zap, ChevronRight, Star, AlertCircle, Heart } from "lucide-react";
import { UserProfile, RewardTransaction } from "../types";

interface RewardsProps {
  currentUser: UserProfile;
  rewardsHistory: RewardTransaction[];
}

export default function Rewards({ currentUser, rewardsHistory }: RewardsProps) {
  // Simple Level Formula: Level = math.floor(points / 200) + 1
  const points = currentUser.points;
  const currentLevel = Math.floor(points / 200) + 1;
  const nextLevelPoints = currentLevel * 200;
  const currentLevelBasePoints = (currentLevel - 1) * 200;
  const pointsProgress = points - currentLevelBasePoints;
  const progressPercent = Math.min(100, Math.round((pointsProgress / 200) * 100));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" id="rewards-page">
      
      {/* Intro Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-600/20">
          <Gift className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Citizen Rewards & <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Level Progress</span>
        </h1>
        <p className="text-slate-600 text-sm max-w-md">
          Your active contributions safeguard the neighborhood. Build up points to level up and unlock official city commendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Level Progress Circle Card */}
        <div className="md:col-span-1 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Your Current Level</span>
          
          {/* Level Badge Circle */}
          <div className="relative flex items-center justify-center h-36 w-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="72" cy="72" r="60" 
                className="stroke-slate-100 stroke-[8] fill-none"
              />
              <circle 
                cx="72" cy="72" r="60" 
                className="stroke-teal-600 stroke-[8] fill-none transition-all duration-500"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-black text-slate-800 leading-none">{currentLevel}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Level</span>
            </div>
          </div>

          <div className="space-y-1 w-full">
            <div className="flex justify-between text-xs text-slate-600 font-semibold px-2">
              <span>{points} Total PTS</span>
              <span>{nextLevelPoints} PTS</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
              Need {nextLevelPoints - points} more points to reach Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* Right Hand Side: Points log transaction list */}
        <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800">Points History Log</h3>
              <p className="text-xs text-slate-500">Every verification vote and validated report adds up</p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
              Active Session
            </span>
          </div>

          <div className="space-y-3">
            {rewardsHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Heart className="h-8 w-8 text-slate-300 mb-2 animate-pulse" />
                <p className="text-xs font-bold text-slate-600">No transactions recorded yet</p>
                <p className="text-[10px] text-slate-500 mt-1">Submit a report or verification to trigger points!</p>
              </div>
            ) : (
              rewardsHistory.map((tr) => (
                <div 
                  key={tr.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-50 bg-slate-50/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{tr.action}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{tr.description}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-1">{new Date(tr.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-700">
                      +{tr.pointsEarned} PTS
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Guidelines on how to earn */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Star className="h-4 w-4 text-teal-600 fill-teal-100" />
              How to Accumulate Points:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[10px] font-semibold">
              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                <p className="text-teal-600 text-sm font-bold font-mono">+20</p>
                <p className="text-slate-500 mt-0.5">Submit Report</p>
              </div>
              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                <p className="text-teal-600 text-sm font-bold font-mono">+50</p>
                <p className="text-slate-500 mt-0.5">Verify Issue</p>
              </div>
              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                <p className="text-teal-600 text-sm font-bold font-mono">+100</p>
                <p className="text-slate-500 mt-0.5">Issue Resolved</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
