import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle, 
  ArrowRight, 
  Cpu, 
  ShieldCheck,
  Smartphone,
  Check,
  ThumbsUp
} from "lucide-react";
import { UserProfile, LocationData } from "../types";

interface ReportIssueProps {
  currentUser: UserProfile;
  initialLocation: LocationData | null;
  onIssueCreated: (newIssue: any) => void;
  onSetActiveTab: (tab: string) => void;
}

export default function ReportIssue({
  currentUser,
  initialLocation,
  onIssueCreated,
  onSetActiveTab
}: ReportIssueProps) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState("");
  const [duplicateAlert, setDuplicateAlert] = useState<any>(null);
  const [aiReport, setAiReport] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Preset Evidence Images for convenient demo evaluation
  const PRESET_EVIDENCE: any[] = [];

  // Capture location automatically on mount
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      setLocationAddress(initialLocation.address || "Locked GPS Coordinates");
    } else {
      triggerGetLocation();
    }
  }, [initialLocation]);

  const triggerGetLocation = () => {
    setFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ latitude: lat, longitude: lng });
          setLocationAddress(`GPS Lock (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setFetchingLocation(false);
        },
        (err) => {
          console.warn("Geolocation permission blocked or timed out, applying Hyderabad sector coordinates.");
          // Fallback Hyderabad, India
          const lat = 17.3850 + (Math.random() - 0.5) * 0.02;
          const lng = 78.4867 + (Math.random() - 0.5) * 0.02;
          setLocation({ latitude: lat, longitude: lng });
          setLocationAddress(`GPS Sector Area (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setFetchingLocation(false);
        }
      );
    } else {
      setFetchingLocation(false);
    }
  };

  // Convert File uploads to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAiReport(null);
        setDuplicateAlert(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_EVIDENCE[0]) => {
    setImage(preset.image);
    setLocation(preset.location);
    setLocationAddress(preset.location.address);
    setAiReport(null);
    setDuplicateAlert(null);
  };

  // Trigger Autonomous AI Workflow (Duplicate check + Gemini Analysis)
  const handleAnalyzeIssue = async () => {
    if (!image) return;
    if (!location) {
      triggerGetLocation();
      return;
    }

    setAnalyzing(true);
    setDuplicateAlert(null);
    setAiReport(null);

    try {
      const response = await fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: locationAddress
          },
          deviceInfo: "Chrome Browser, " + navigator.userAgent.split(" ")[0],
          reporterId: currentUser.id
        })
      });

      const data = await response.json();

      if (data.duplicateFound) {
        setDuplicateAlert(data);
      } else {
        setAiReport(data.analysis);
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Join the duplicate issue (upvote it instead of repeating)
  const handleJoinDuplicate = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (response.ok) {
        // Redirect to map to see status
        onSetActiveTab("map");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Final Publish Action
  const handlePublishReport = async () => {
    if (!aiReport || !location) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/issues/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: aiReport,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: locationAddress
          },
          deviceInfo: "Chrome 122, " + navigator.platform,
          reporterId: currentUser.id,
          image
        })
      });

      if (response.ok) {
        const newIssue = await response.json();
        onIssueCreated(newIssue);
        onSetActiveTab("dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" id="report-issue-page">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-[#202124] sm:text-4xl">
          Report a <span className="text-[#4285F4]">Civic Problem</span>
        </h1>
        <p className="text-[#5F6368] text-sm max-w-md mx-auto">
          Capture evidence, locking down precise GPS telemetry. Let autonomous AI agents classify, routing directly to the appropriate agency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Hand side: Evidence Upload & Capture */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-[#202124] uppercase tracking-wider flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#4285F4]" />
              1. Collect Evidence
            </h3>

            {/* Custom file drop area */}
            <div className="relative h-56 w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-[#4285F4] transition-colors flex flex-col items-center justify-center bg-slate-50 overflow-hidden group">
              {image ? (
                <>
                  <img src={image} alt="Civic Evidence" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="bg-white text-slate-800 px-3.5 py-1.5 rounded-md text-xs font-bold cursor-pointer hover:bg-slate-50">
                      Change Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1967D2] mb-2">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-[#202124]">Drag or click to upload photo</span>
                  <span className="text-[10px] text-[#5F6368] mt-1">JPEG, PNG up to 10MB</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Demo Evidence presets */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#5F6368]">Evaluate with Demo Presets:</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_EVIDENCE.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                      image === preset.image 
                        ? "bg-[#E8F0FE] border-[#4285F4] text-[#1967D2] font-semibold" 
                        : "bg-slate-50 border-slate-200 text-[#5F6368] hover:bg-slate-100"
                    }`}
                  >
                    <img src={preset.image} alt={preset.label} className="h-8 w-8 rounded object-cover shrink-0" />
                    <span className="text-[10px] truncate leading-tight">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Telemetry Tracker */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#202124] flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                  GPS Telemetry
                </span>
                <button
                  onClick={triggerGetLocation}
                  disabled={fetchingLocation}
                  className="text-[10px] font-bold text-[#1967D2] hover:text-[#1557B0] disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${fetchingLocation ? "animate-spin" : ""}`} />
                  Recalibrate
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                <p className="text-xs font-semibold text-slate-800 truncate">{locationAddress || "Awaiting GPS Signal..."}</p>
                <div className="flex gap-4 text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>Lat: {location?.latitude.toFixed(5) || "Searching"}</span>
                  <span>Lng: {location?.longitude.toFixed(5) || "Searching"}</span>
                </div>
              </div>
            </div>

            {/* Core Action Trigger */}
            <button
              onClick={handleAnalyzeIssue}
              disabled={!image || analyzing}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>AI Agent Orchestrating Workflow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-400 fill-current" />
                  <span>Trigger Autonomous AI Diagnosis</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Hand side: AI Diagnosis Report Output */}
        <div className="space-y-6">
          
          {/* Default state */}
          {!duplicateAlert && !aiReport && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-full min-h-[350px] flex flex-col items-center justify-center p-6 text-center">
              <Cpu className="h-12 w-12 text-slate-400 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Awaiting AI Telemetry Analysis</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Upload or select an evidence preset, calibrate GPS, then tap "Trigger Autonomous AI Diagnosis" to execute the Gemini agent.
              </p>
            </div>
          )}

          {/* duplicate detected UI */}
          {duplicateAlert && (
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Duplicate Report Identified!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Our duplicate detection agent found a highly similar complaint within 150 meters.
                </p>
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-2">
                {duplicateAlert.potentialDuplicates.map((dup: any) => (
                  <div key={dup.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{dup.title}</p>
                      <p className="text-[10px] text-slate-500">{dup.category} • Distance: {dup.distanceM}m</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-800">{dup.status}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-teal-50/50 p-3.5 border border-teal-100/40 flex items-start gap-2.5">
                <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-teal-800">Consolidate to earn +20 PTS!</p>
                  <p className="text-teal-700 mt-0.5 leading-relaxed">
                    By upvoting this duplicate rather than creating a new card, you consolidate municipal response and earn a quick 20 points!
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleJoinDuplicate(duplicateAlert.potentialDuplicates[0].id)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Join Existing Complaint</span>
                </button>
                <button
                  onClick={() => setAiReport({
                    title: "Bypassed - Unique Issue",
                    category: "Road Damage",
                    description: "Citizen claims this is an independent, distinct incident from the nearby report.",
                    severity: "medium",
                    confidenceScore: 80,
                    suggestedDepartment: "Roads Department"
                  })}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-4 py-2.5 rounded-md text-xs font-semibold"
                >
                  Bypass & Force Create
                </button>
              </div>
            </div>
          )}

          {/* AI generated report UI */}
          {aiReport && (
            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-200">
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0FE] text-[#1967D2] shadow-sm">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">AI Diagnosis Output</h3>
                  </div>
                </div>
                <span className="bg-[#E6F4EA] text-[#137333] px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono">
                  {aiReport.confidenceScore}% MATCH
                </span>
              </div>

              {/* Title and descriptions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Issue Title</label>
                <input 
                  type="text" 
                  value={aiReport.title}
                  onChange={(e) => setAiReport({ ...aiReport, title: e.target.value })}
                  className="w-full text-sm font-bold border-b border-gray-200 focus:border-[#4285F4] focus:outline-none pb-1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Category Detection</label>
                <p className="text-xs font-semibold text-[#202124] bg-slate-50 px-2.5 py-1.5 rounded-md border border-gray-100">{aiReport.category}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Severity Prediction</label>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                    aiReport.severity === "critical" ? "bg-[#FCE8E6] text-[#C5221F]" : aiReport.severity === "high" ? "bg-[#FEEFC3] text-[#B06000]" : "bg-[#E6F4EA] text-[#137333]"
                  }`}>
                    {aiReport.severity} Severity
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Detailed Description</label>
                <textarea 
                  value={aiReport.description}
                  onChange={(e) => setAiReport({ ...aiReport, description: e.target.value })}
                  rows={3}
                  className="w-full text-xs text-[#202124] border border-gray-200 rounded-md p-2 focus:border-[#4285F4] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Estimated Dimension</p>
                  <p className="font-semibold text-[#202124] mt-0.5">{aiReport.estimatedSize || "Awaiting ground survey"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Suggested Agency</p>
                  <p className="font-semibold text-[#1967D2] mt-0.5">{aiReport.suggestedDepartment}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono font-semibold tracking-wider text-[#5F6368] uppercase">Urgency & Safety Reasoning</p>
                <p className="text-[#5F6368] text-xs italic mt-0.5 leading-relaxed">{aiReport.urgencyReasoning || "Standard routing index applied."}</p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={handlePublishReport}
                  disabled={submitting}
                  className="w-full bg-[#188038] hover:bg-[#137333] text-white py-3 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Confirm & Publish Complaint (+20 PTS)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
