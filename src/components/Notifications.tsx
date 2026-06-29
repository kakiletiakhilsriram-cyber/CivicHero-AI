import { Bell, Check, Clock, ShieldAlert, Cpu, Award } from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationsProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export default function Notifications({ notifications, onMarkAllRead }: NotificationsProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case "verification": return <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />;
      case "update": return <Cpu className="h-4.5 w-4.5 text-indigo-500" />;
      case "badge": return <Award className="h-4.5 w-4.5 text-amber-500" />;
      default: return <Award className="h-4.5 w-4.5 text-teal-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" id="notifications-page">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-700" />
          <h1 className="font-display text-xl font-bold text-slate-800">Your Activity Feed</h1>
        </div>
        
        {notifications.some(n => !n.read) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bell className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
            <p className="text-sm font-bold text-slate-600">All caught up!</p>
            <p className="text-xs text-slate-500">New system audits and community alerts will display here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                notif.read 
                  ? "bg-white border-slate-100 opacity-75" 
                  : "bg-teal-50/30 border-teal-100 shadow-sm"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xs font-bold text-slate-800">{notif.title}</h3>
                  <span className="text-[9px] font-mono text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(notif.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-600 self-center animate-ping" />
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
}
