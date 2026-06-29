import { useState, useEffect } from "react";
import { 
  Cpu, 
  ShieldAlert, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  AlertOctagon,
  ArrowRight
} from "lucide-react";
import { InfrastructurePrediction } from "../types";

interface PredictionsProps {
  onSetActiveTab: (tab: string) => void;
}

export default function Predictions({ onSetActiveTab }: PredictionsProps) {
  const [predictions, setPredictions] = useState<InfrastructurePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predictions");
      const data = await response.json();
      setPredictions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const response = await fetch("/api/predictions"); // Re-reads database & triggers Gemini
      const data = await response.json();
      setPredictions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRecalculating(false);
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-amber-100 text-amber-700 border-amber-200";
      case "medium": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-teal-100 text-teal-700 border-teal-200";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" id="predictions-page">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Predictive <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Infrastructure Intelligence</span>
            </h1>
            <p className="text-slate-500 text-xs">Autonomous Gemini agent scanning cluster patterns and forecasting urban failures</p>
          </div>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating || loading}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          {recalculating ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Scanning Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-current" />
              <span>Re-run Predictive Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Main predictions section */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">Gemini parsing historical telemetry files...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Intelligence summary card */}
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-5 rounded-3xl flex items-start gap-4 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">AI Recurrence Diagnostics</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                By comparing category density, geolocation clusters (within 100m radii), and seasonal weather trends, the autonomous AI models identify subterranean pipe stresses, recurring trash heaps, and tree hazard zones before they culminate in public incidents.
              </p>
            </div>
          </div>

          {/* Predictions lists */}
          <div className="space-y-4">
            {predictions.map((pred) => (
              <div 
                key={pred.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors flex flex-col sm:flex-row gap-4"
              >
                {/* Visual Indicator icon based on threat level */}
                <div className="flex sm:flex-col items-center justify-center shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                    pred.likelihood === "critical"
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    <AlertOctagon className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  
                  {/* Top line categories */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border uppercase ${getLikelihoodColor(pred.likelihood)}`}>
                        {pred.likelihood} Risk
                      </span>
                      {pred.priorityZone && (
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase animate-pulse">
                          Priority Inspection Zone
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{pred.trend}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-slate-800">{pred.issueType}</h3>
                    <p className="text-xs text-slate-500 font-medium">📍 Area: <span className="text-slate-800">{pred.area}</span></p>
                  </div>

                  {/* Recommendation Block */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/60 space-y-1">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Public Works Recommendation</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{pred.recommendation}</p>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Call to action footer */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-indigo-900 font-semibold leading-relaxed max-w-md text-center sm:text-left">
              Public Safety and Inspection teams can deploy directly to these sectors. View coordinates on the map ledger to identify existing telemetry.
            </p>
            <button
              onClick={() => onSetActiveTab("map")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <span>Audit Map Telemetry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
