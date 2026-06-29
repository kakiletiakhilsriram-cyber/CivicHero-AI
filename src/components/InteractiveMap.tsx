import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { 
  MapPin, 
  Layers, 
  Filter, 
  Flame, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Clock, 
  ArrowRight,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Navigation,
  Sparkles,
  Info
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { CivicIssue, IssueStatus, UserProfile } from "../types";

interface InteractiveMapProps {
  issues: CivicIssue[];
  currentUser: UserProfile;
  onSelectIssue: (issue: CivicIssue) => void;
  onSetReportLocation: (lat: number, lng: number, address: string) => void;
  onVoteIssue: (issueId: string) => void;
  onVerifyIssue: (issueId: string, status: string) => void;
}

// Read the Google Maps API Key exposed via Vite define config
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = 
  typeof API_KEY === "string" && 
  API_KEY.startsWith("AIzaSy") && 
  API_KEY.length === 39;

class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Map component caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">Map failed to load. Please try refreshing.</p>
        </div>
      );
    }
    return this.props.children;
  }
}


export default function InteractiveMap({
  issues,
  currentUser,
  onSelectIssue,
  onSetReportLocation,
  onVoteIssue,
  onVerifyIssue
}: InteractiveMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [mapStyle, setMapStyle] = useState<"standard" | "satellite">("standard");
  const [hoveredIssue, setHoveredIssue] = useState<CivicIssue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // San Francisco bounding box for mock coordinate mapping (fallback)
  const MAP_BOUNDS = {
    minLat: 37.7500,
    maxLat: 37.7900,
    minLng: -122.4900,
    maxLng: -122.4000
  };

  // Map lat/lng coordinates to standard SVG coordinates (percent 0-100)
  const getXY = (lat: number, lng: number) => {
    const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    const y = (1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    return { x, y };
  };

  // Convert SVG clicks back to lat/lng coordinates (fallback map click)
  const handleFallbackMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Convert back to coordinates
    const lng = MAP_BOUNDS.minLng + (clickX / 100) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const lat = MAP_BOUNDS.minLat + (1 - clickY / 100) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);

    const addresses = [
      "Union St & Fillmore St, SF",
      "Gough St & Geary Blvd, SF",
      "Valencia St & 18th St, SF",
      "Lombard St & Van Ness Ave, SF",
      "Market St & 5th St, SF",
      "Divisadero St & McAllister St, SF"
    ];
    const address = addresses[Math.floor(Math.random() * addresses.length)];

    setTempPin({ lat, lng, address });
    onSetReportLocation(lat, lng, address);
  };

  // Google Maps click event handler
  const handleGoogleMapClick = (lat: number, lng: number) => {
    const addresses = [
      "Union St & Fillmore St, SF",
      "Gough St & Geary Blvd, SF",
      "Valencia St & 18th St, SF",
      "Lombard St & Van Ness Ave, SF",
      "Market St & 5th St, SF",
      "Divisadero St & McAllister St, SF"
    ];
    const address = addresses[Math.floor(Math.random() * addresses.length)];

    setTempPin({ lat, lng, address });
    onSetReportLocation(lat, lng, address);
  };

  // Filters application
  const filteredIssues = issues.filter(issue => {
    const matchesCat = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesSev = selectedSeverity === "All" || issue.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "All" || issue.status === selectedStatus;
    return matchesCat && matchesSev && matchesStatus;
  });

  // Marker style generators
  const getMarkerColor = (category: string, severity: string) => {
    if (severity === "critical") return "from-red-500 to-rose-600";
    if (severity === "high") return "from-amber-500 to-orange-600";
    
    switch (category) {
      case "Road Damage": return "from-blue-500 to-indigo-600";
      case "Garbage": return "from-slate-500 to-neutral-700";
      case "Water Leakage": return "from-cyan-500 to-teal-600";
      case "Tree Fallen": return "from-emerald-500 to-green-600";
      case "Drainage": return "from-purple-500 to-violet-600";
      default: return "from-teal-500 to-emerald-600";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-4 px-4 py-2" id="interactive-map-page">
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto shrink-0">
        
        <div>
          <h2 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-600" />
            Map Filters
          </h2>
          <p className="text-xs text-slate-500">Isolate civic issues by core attributes</p>
        </div>

        {/* Categories */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</label>
          <div className="flex flex-wrap gap-1">
            {["All", "Road Damage", "Garbage", "Water Leakage", "Tree Fallen", "Drainage"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-teal-600 text-white" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Severity Index</label>
          <div className="flex flex-wrap gap-1">
            {["All", "low", "medium", "high", "critical"].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer ${
                  selectedSeverity === sev 
                    ? "bg-slate-800 text-white" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Progress Status</label>
          <div className="flex flex-wrap gap-1">
            {["All", "reported", "verified", "assigned", "in_progress", "resolved"].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer ${
                  selectedStatus === st 
                    ? "bg-slate-800 text-white" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st === "in_progress" ? "In Progress" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Map Layers */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Intelligence Layers</h3>
          

          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setMapStyle("standard")}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mapStyle === "standard" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Vector Map
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mapStyle === "satellite" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Satellite Layer
            </button>
          </div>
        </div>

        {/* Interaction Info Banner */}
        <div className="mt-auto rounded-xl bg-slate-50 border border-slate-100 p-3 flex gap-2">
          <Navigation className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Quick-Pin placement: </span>
            Click anywhere on the map grid to lock GPS coordinates and immediately initiate a local complaint report.
          </div>
        </div>

      </div>

      {/* Map Grid Container */}
      <div className="flex-1 relative bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner select-none h-full min-h-[300px]">
        
        {hasValidKey ? (
          <MapErrorBoundary>
            <APIProvider apiKey={API_KEY} version="weekly" libraries={["visualization"]}>
              <Map
                mapId="7a9e2ebecd32a903"
                defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI={true}
                onClick={(e) => {
                  if (e.detail?.latLng) {
                    const latLng = e.detail.latLng as any;
                    const lat = typeof latLng.lat === "function" ? latLng.lat() : latLng.lat;
                    const lng = typeof latLng.lng === "function" ? latLng.lng() : latLng.lng;
                    handleGoogleMapClick(lat, lng);
                  }
                }}
                mapTypeId={mapStyle === "satellite" ? "satellite" : "roadmap"}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
              >
                {/* Advanced Markers */}
                {filteredIssues.map((issue) => (
                  <AdvancedMarker
                    key={issue.id}
                    position={{ lat: issue.location.latitude, lng: issue.location.longitude }}
                    onClick={() => {
                      setSelectedIssue(issue);
                      onSelectIssue(issue);
                    }}
                  >
                    <div
                      onMouseEnter={() => setHoveredIssue(issue)}
                      onMouseLeave={() => setHoveredIssue(null)}
                      className="relative cursor-pointer flex flex-col items-center"
                    >
                      {/* Tooltip */}
                      {hoveredIssue?.id === issue.id && (
                        <div className="absolute bottom-full mb-2 w-48 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-lg pointer-events-none z-50 flex flex-col gap-1 text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${
                              issue.severity === "critical" ? "bg-red-500" : issue.severity === "high" ? "bg-amber-500" : "bg-teal-500"
                            }`} />
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">{issue.category}</span>
                          </div>
                          <h4 className="text-xs font-bold leading-snug text-slate-900">{issue.title}</h4>
                          <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-teal-600" /> {issue.location.address?.split(",")[0]}
                          </p>
                        </div>
                      )}

                      {/* Pulsing ring */}
                      {issue.status !== "resolved" && (
                        <div 
                          className="absolute h-7 w-7 rounded-full bg-teal-400 animate-ping opacity-25" 
                          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} 
                        />
                      )}
                      {/* Pin design */}
                      <div className="h-6 w-6 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shadow-md hover:scale-125 transition-transform duration-150">
                        <div className={`h-3 w-3 rounded-full ${
                          issue.severity === "critical" ? "bg-red-500" : issue.severity === "high" ? "bg-amber-500" : "bg-teal-500"
                        }`} />
                      </div>
                    </div>
                  </AdvancedMarker>
                ))}

                {/* Clicked pin placement */}
                {tempPin && (
                  <AdvancedMarker position={{ lat: tempPin.lat, lng: tempPin.lng }}>
                    <div className="relative flex flex-col items-center">
                      <div className="h-8 w-8 text-rose-500 filter drop-shadow-md">
                        <MapPin className="h-8 w-8 fill-rose-500 text-white stroke-2" />
                      </div>
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>
          </MapErrorBoundary>
        ) : (
          /* SVG Vector Map Fallback with instructions */
          <>
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              mapStyle === "satellite" 
                ? "bg-slate-900 opacity-90 border border-slate-800" 
                : "bg-slate-50"
            }`}>
              <svg className="w-full h-full text-slate-300" xmlns="http://www.w3.org/2000/svg">
                {mapStyle === "satellite" ? (
                  <>
                    <rect width="100%" height="100%" fill="#111827" />
                    <path d="M 0,150 Q 300,200 600,100 T 1200,300" fill="none" stroke="#1f2937" strokeWidth="60" opacity="0.3" />
                    <path d="M 100,0 Q 400,400 800,200 T 1200,800" fill="none" stroke="#111827" strokeWidth="80" opacity="0.6" />
                    
                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#374151" strokeWidth="1" opacity="0.4" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#374151" strokeWidth="2.5" opacity="0.4" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#374151" strokeWidth="1" opacity="0.4" />
                    <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#374151" strokeWidth="2" opacity="0.4" />
                    <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#374151" strokeWidth="2" opacity="0.4" />
                    
                    <path d="M 0,350 L 1200,350" fill="none" stroke="#4b5563" strokeWidth="8" opacity="0.5" />
                    <path d="M 0,350 L 1200,350" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,5" opacity="0.6" />
                    
                    <rect x="0" y="0" width="100%" height="15%" fill="#1e293b" opacity="0.8" />
                    <rect x="85%" y="0" width="15%" height="100%" fill="#1e293b" opacity="0.8" />
                  </>
                ) : (
                  <>
                    <rect width="100%" height="100%" fill="#f1f5f9" />
                    
                    <path d="M 0,0 L 1200,0 L 1200,100 Q 800,120 500,80 T 0,130 Z" fill="#bae6fd" opacity="0.6" />
                    <path d="M 1000,0 Q 950,300 1100,600 T 1200,900 L 1200,0 Z" fill="#bae6fd" opacity="0.6" />

                    <rect x="5%" y="40%" width="20%" height="25%" rx="10" fill="#dcfce7" opacity="0.7" />
                    <text x="10%" y="52%" className="text-[10px] font-bold text-emerald-800 fill-current opacity-60 font-display">Golden Gate Park</text>

                    <circle cx="50%" cy="45%" r="60" fill="#dcfce7" opacity="0.7" />
                    <text x="46%" y="45%" className="text-[10px] font-bold text-emerald-800 fill-current opacity-60 font-display">Buena Vista</text>

                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#e2e8f0" strokeWidth="4" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="8" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#e2e8f0" strokeWidth="4" />

                    <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#cbd5e1" strokeWidth="6" />
                    <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#e2e8f0" strokeWidth="4" />
                    <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#cbd5e1" strokeWidth="6" />

                    <text x="15px" y="48%" className="text-[9px] font-mono text-slate-400 font-semibold fill-current">MARKET STREET</text>
                    <text x="31%" y="95%" className="text-[9px] font-mono text-slate-400 font-semibold fill-current rotate-90 origin-left">HAIGHT AVENUE</text>
                    <text x="15px" y="18%" className="text-[9px] font-mono text-slate-400 font-semibold fill-current">GEARY BOULEVARD</text>
                  </>
                )}
              </svg>
            </div>

            <svg 
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onClick={handleFallbackMapClick}
            >
              <defs>
                <radialGradient id="heatmap-critical" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="30%" stopColor="#ef4444" stopOpacity="0.45" />
                  <stop offset="65%" stopColor="#f43f5e" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatmap-high" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatmap-medium" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.75" />
                  <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.4" />
                  <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatmap-low" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                  <stop offset="30%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="65%" stopColor="#34d399" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Fallback SVG Heatmap layer */}
              {filteredIssues.map(issue => {
                const { x, y } = getXY(issue.location.latitude, issue.location.longitude);
                let gradientId = "heatmap-critical";
                let radius = 70;
                
                if (issue.severity === "high") {
                  gradientId = "heatmap-high";
                  radius = 55;
                } else if (issue.severity === "medium") {
                  gradientId = "heatmap-medium";
                  radius = 42;
                } else if (issue.severity === "low") {
                  gradientId = "heatmap-low";
                  radius = 30;
                }

                return (
                  <g key={`heatmap-${issue.id}`} className="pointer-events-none">
                    <circle 
                      cx={`${x}%`} 
                      cy={`${y}%`} 
                      r={radius * 1.6} 
                      fill={`url(#${gradientId})`} 
                      opacity="0.5"
                      className="animate-pulse"
                    />
                    <circle 
                      cx={`${x}%`} 
                      cy={`${y}%`} 
                      r={radius} 
                      fill={`url(#${gradientId})`} 
                    />
                  </g>
                );
              })}

              {/* Render fallback markers */}
              {filteredIssues.map(issue => {
                const { x, y } = getXY(issue.location.latitude, issue.location.longitude);
                const isSelected = selectedIssue?.id === issue.id;

                return (
                  <g 
                    key={issue.id}
                    onMouseEnter={() => setHoveredIssue(issue)}
                    onMouseLeave={() => setHoveredIssue(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIssue(issue);
                      onSelectIssue(issue);
                    }}
                    className="cursor-pointer group"
                  >
                    {issue.status !== "resolved" && (
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r={isSelected ? "16" : "10"}
                        className="fill-current text-teal-400 animate-ping opacity-25"
                      />
                    )}
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r={isSelected ? "12" : "8"}
                      className="fill-white stroke-teal-500 stroke-2 drop-shadow-md group-hover:scale-125 transition-transform duration-150"
                    />
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r={isSelected ? "8" : "5"}
                      fill={issue.severity === "critical" ? "#ef4444" : issue.severity === "high" ? "#f59e0b" : "#0d9488"}
                    />
                  </g>
                );
              })}

              {/* SVG Fallback tooltip */}
              {!hasValidKey && hoveredIssue && (
                <foreignObject x={getXY(hoveredIssue.location.latitude, hoveredIssue.location.longitude).x} y={getXY(hoveredIssue.location.latitude, hoveredIssue.location.longitude).y - 10} width="200" height="150">
                    <div className="absolute w-48 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-lg pointer-events-none z-50 flex flex-col gap-1 text-slate-800"
                        style={{
                            left: `${getXY(hoveredIssue.location.latitude, hoveredIssue.location.longitude).x}%`,
                            top: `${getXY(hoveredIssue.location.latitude, hoveredIssue.location.longitude).y}%`,
                            transform: "translate(-50%, -120%)"
                        }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          hoveredIssue.severity === "critical" ? "bg-red-500" : hoveredIssue.severity === "high" ? "bg-amber-500" : "bg-teal-500"
                        }`} />
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">{hoveredIssue.category}</span>
                      </div>
                      <h4 className="text-xs font-bold leading-snug text-slate-900">{hoveredIssue.title}</h4>
                      <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-teal-600" /> {hoveredIssue.location.address?.split(",")[0]}
                      </p>
                    </div>
                </foreignObject>
              )}

              {/* Click-dropped target pin */}
              {tempPin && (
                <g>
                  <g transform={`translate(${getXY(tempPin.lat, tempPin.lng).x - 12}, ${getXY(tempPin.lat, tempPin.lng).y - 28})`}>
                    <path 
                      d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" 
                      fill="#f43f5e" 
                      className="drop-shadow-lg"
                    />
                    <circle cx="12" cy="12" r="4" fill="white" />
                  </g>
                </g>
              )}
            </svg>

            {/* Prompt Banner to Enter Google Maps API Key */}
            <div className="absolute top-14 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-teal-100 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
              <div className="flex gap-2.5 items-start">
                <Sparkles className="h-5 w-5 text-teal-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Unlock Live Google Maps Visualization
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Provide a <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> in application secrets to instantly enable high-fidelity Heatmaps, active satellite layers, and real-time reverse address geocoding.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors text-center cursor-pointer"
                >
                  Get Key ↗
                </a>
                <button
                  onClick={() => {
                    // Trigger key setup popup flow by evaluating/accessing the process.env directly
                    const promptKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;
                    alert("To enter your key:\n1. Click 'Settings' (⚙️ gear icon, top-right)\n2. Open 'Secrets'\n3. Add 'GOOGLE_MAPS_PLATFORM_KEY' and paste your key.");
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors text-center cursor-pointer"
                >
                  Setup Key
                </button>
              </div>
            </div>
          </>
        )}

        {/* Click telemetry HUD */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700/50 text-white font-mono text-[10px] tracking-wider flex items-center gap-2 z-10">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>INCIDENT HUD: ACTIVE FEED</span>
          <span className="text-slate-400">|</span>
          <span>SF COORDINATES LOCK ON</span>
        </div>

        {/* Temporary Pin Locked floating notification */}
        {tempPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 shadow-xl max-w-sm flex flex-col gap-2 z-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-rose-400 font-semibold uppercase tracking-wider">Coordinates Locked 📍</p>
                <p className="text-sm font-semibold mt-0.5 leading-snug">{tempPin.address}</p>
                <p className="text-[10px] font-mono text-slate-400">Lat: {tempPin.lat.toFixed(4)}, Lng: {tempPin.lng.toFixed(4)}</p>
              </div>
              <button onClick={() => setTempPin(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => onSetReportLocation(tempPin.lat, tempPin.lng, tempPin.address)}
              className="w-full bg-rose-500 text-center py-2 rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Initialize Report at Pin</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Slide-over flyout details panel */}
      {selectedIssue && (
        <div className="w-full lg:w-96 flex flex-col bg-white p-4 rounded-2xl border border-slate-200 shadow-xl overflow-y-auto z-20 animate-in slide-in-from-right duration-200 shrink-0">
          <div className="flex justify-between items-start pb-3 border-b border-slate-100">
            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                selectedIssue.severity === "critical" 
                  ? "bg-red-100 text-red-700" 
                  : selectedIssue.severity === "high" 
                  ? "bg-amber-100 text-amber-700" 
                  : "bg-teal-100 text-teal-700"
              }`}>
                {selectedIssue.severity} Severity
              </span>
              <p className="text-xs font-semibold text-slate-500 mt-1">{selectedIssue.category}</p>
            </div>
            <button onClick={() => setSelectedIssue(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            
            {/* Image Preview */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
              <img 
                src={selectedIssue.image} 
                alt={selectedIssue.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-lg text-white font-mono text-[9px]">
                Confidence: {selectedIssue.confidenceScore}%
              </div>
            </div>

            {/* Core Info */}
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-slate-900 leading-snug">{selectedIssue.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedIssue.description}</p>
            </div>

            {/* Location Address */}
            <div className="flex gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{selectedIssue.location.address}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Lat: {selectedIssue.location.latitude.toFixed(5)}, Lng: {selectedIssue.location.longitude.toFixed(5)}</p>
              </div>
            </div>

            {/* AI Diagnostics details */}
            <div className="bg-gradient-to-tr from-slate-900 to-teal-950 text-white rounded-xl p-3.5 space-y-2.5 shadow-md">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold uppercase">Autonomous Agent Report</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-2.5">
                <div>
                  <p className="text-slate-400 text-[10px]">Estimated Size</p>
                  <p className="font-semibold text-slate-100">{selectedIssue.estimatedSize || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Responsible Department</p>
                  <p className="font-semibold text-slate-100">{selectedIssue.suggestedDepartment}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] leading-tight">Public Safety Risk</p>
                <p className="text-slate-200 text-xs font-medium mt-0.5 leading-snug">{selectedIssue.publicRisk || "N/A"}</p>
              </div>
            </div>

            {/* Vote Action */}
            <div className="flex gap-2">
              <button
                onClick={() => onVoteIssue(selectedIssue.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedIssue.votedUserIds.includes(currentUser.id)
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : "bg-teal-600 hover:bg-teal-700 text-white"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{selectedIssue.votedUserIds.includes(currentUser.id) ? "Joint Incident Joined" : "Join & Upvote Issue"}</span>
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{selectedIssue.votes}</span>
              </button>
            </div>

            {/* Direct Verification workflow for volunteers */}
            {currentUser.role === "Volunteer" && selectedIssue.status === "reported" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-amber-700" />
                  Volunteer Action: Community Verification
                </p>
                <p className="text-[11px] text-amber-700">Your trust weight is {Math.floor(currentUser.trustScore/10)}. Submit an official verification vote:</p>
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      onVerifyIssue(selectedIssue.id, "verified");
                      setSelectedIssue(null);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Verify (Valid)
                  </button>
                  <button
                    onClick={() => {
                      onVerifyIssue(selectedIssue.id, "false_report");
                      setSelectedIssue(null);
                    }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    False Report
                  </button>
                </div>
              </div>
            )}

            {/* Issue Progress Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-500" /> Status Timeline
              </h4>
              <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {selectedIssue.timeline.map((evt, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                      evt.status === "resolved" 
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700" 
                        : evt.status === "in_progress" 
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700" 
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}>
                      <span className="text-[9px] font-bold">●</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 capitalize">{evt.status.replace("_", " ")}</span>
                        <span className="text-[9px] font-mono text-slate-400">{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{evt.remarks}</p>
                      {evt.officer && <p className="text-[10px] text-teal-600 font-medium mt-0.5">Officer: {evt.officer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
