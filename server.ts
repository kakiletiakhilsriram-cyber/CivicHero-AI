import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { 
  UserProfile, 
  CivicIssue, 
  Comment, 
  NotificationItem, 
  VerificationVote, 
  InfrastructurePrediction, 
  RewardTransaction,
  UserRole
} from "./src/types";

dotenv.config();

// Initialize Express App
const app = express();
const PORT = 3000;

// Enable JSON parser with high limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path for simulated database file
const DB_FILE = path.join(process.cwd(), "simulated_db.json");

// Helper to calculate distance in km between two points (Haversine formula)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Global In-Memory Database State
let db = {
  users: [] as UserProfile[],
  issues: [] as CivicIssue[],
  comments: [] as Comment[],
  notifications: [] as NotificationItem[],
  verifications: [] as VerificationVote[],
  predictions: [] as InfrastructurePrediction[],
  rewards: [] as RewardTransaction[],
};

// Seed initial database if not exists
const DEFAULT_USERS: UserProfile[] = [
  {
    id: "user_citizen",
    name: "Alex Johnson",
    email: "citizen@civichero.org",
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    role: "Citizen",
    points: 120,
    badges: ["Community Hero"],
    reportsCount: 3,
    verifiedReports: 2,
    resolvedReports: 1,
    rank: 4,
    trustScore: 85,
  },
  {
    id: "user_volunteer",
    name: "Samantha Green",
    email: "volunteer@civichero.org",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    role: "Volunteer",
    points: 450,
    badges: ["Top Verifier", "Neighborhood Guardian"],
    reportsCount: 8,
    verifiedReports: 12,
    resolvedReports: 4,
    rank: 1,
    trustScore: 98,
  },
  {
    id: "user_officer",
    name: "Chief Officer Marcus",
    email: "officer@civichero.org",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
    role: "Department Officer",
    points: 150,
    badges: ["Problem Solver"],
    reportsCount: 0,
    verifiedReports: 15,
    resolvedReports: 12,
    rank: 3,
    trustScore: 100,
  },
  {
    id: "user_admin",
    name: "Elena Rostova",
    email: "admin@civichero.org",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    role: "Administrator",
    points: 200,
    badges: ["Problem Solver", "Community Hero"],
    reportsCount: 1,
    verifiedReports: 20,
    resolvedReports: 18,
    rank: 2,
    trustScore: 100,
  }
];

const DEFAULT_ISSUES: CivicIssue[] = [];

const DEFAULT_PREDICTIONS: InfrastructurePrediction[] = [
  {
    id: "pred_1",
    area: "Sunset District (Around Haight St & Cole St)",
    issueType: "Water Pipeline Leakage",
    reportsCount: 18,
    likelihood: "high",
    recommendation: "Inspect underground 12-inch water mains along Cole St. The current telemetry and rapid reporting sequence points to an active structural joint failure under the sidewalk.",
    priorityZone: true,
    trend: "+45% reports spike vs average month"
  },
  {
    id: "pred_2",
    area: "Mission District (Around 24th & 26th St)",
    issueType: "Garbage & Illegal Dumping Hotspot",
    reportsCount: 42,
    likelihood: "critical",
    recommendation: "Establish automated CCTV surveillance and schedule secondary municipal sweeps at 11 PM daily. High correlations with commercial food waste overflow patterns.",
    priorityZone: true,
    trend: "+60% recurrent complaints weekly"
  },
  {
    id: "pred_3",
    area: "Richmond District (Outer Geary Blvd)",
    issueType: "Tree Care / Fallen Branches Risk",
    reportsCount: 8,
    likelihood: "medium",
    recommendation: "Pre-emptively trim eucalyptus trees along Outer Geary. Historical storm wind directions show these trees are subject to shear forces leading to rapid branch snaps.",
    priorityZone: false,
    trend: "Stable baseline"
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    userId: "user_citizen",
    title: "Issue Status Updated 🎉",
    message: "Your reported Pothole on Market St has been marked 'In Progress' by Roads Department.",
    type: "update",
    read: false,
    createdAt: "2026-06-24T14:00:00Z"
  },
  {
    id: "notif_2",
    userId: "user_volunteer",
    title: "Nearby Verification Requested 📍",
    message: "A new Water Leakage was reported 400m from your current location on Haight St. Can you verify?",
    type: "verification",
    read: false,
    createdAt: "2026-06-24T09:05:00Z"
  },
  {
    id: "notif_3",
    userId: "user_citizen",
    title: "Points Awarded +20! 🎖️",
    message: "You earned 20 points for reporting a valid, AI-approved civic issue.",
    type: "reward",
    read: true,
    createdAt: "2026-06-23T10:02:00Z"
  }
];

// Load Database From File or Save default Seed
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
    } catch (e) {
      console.error("Error reading simulated DB, resetting defaults:", e);
      resetToDefaults();
    }
  } else {
    resetToDefaults();
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing simulated DB file:", e);
  }
}

function resetToDefaults() {
  db.users = [...DEFAULT_USERS];
  db.issues = [...DEFAULT_ISSUES];
  db.comments = [
    {
      id: "comment_1",
      issueId: "issue_1",
      userId: "user_volunteer",
      userName: "Samantha Green",
      userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      text: "I walked past this morning, and the potholes have indeed expanded. High collision risk indeed!",
      createdAt: "2026-06-23T11:00:00Z"
    },
    {
      id: "comment_2",
      issueId: "issue_1",
      userId: "user_officer",
      userName: "Chief Officer Marcus",
      userPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
      text: "Road repair crew has assigned the asphalt patch. Will update once the roller is on site.",
      createdAt: "2026-06-24T08:35:00Z"
    }
  ];
  db.notifications = [...DEFAULT_NOTIFICATIONS];
  db.verifications = [
    {
      id: "v_1",
      issueId: "issue_1",
      userId: "user_volunteer",
      userName: "Samantha Green",
      status: "verified",
      weight: 10,
      createdAt: "2026-06-23T11:15:00Z"
    }
  ];
  db.predictions = [...DEFAULT_PREDICTIONS];
  db.rewards = [
    {
      id: "reward_1",
      userId: "user_citizen",
      pointsEarned: 20,
      action: "Report valid issue",
      description: "Reported Market St Pothole, passed AI vision vetting",
      createdAt: "2026-06-23T10:02:00Z"
    }
  ];
  saveDB();
}

loadDB();

// Lazy Initializer for Gemini API
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Return null to fall back to robust local deterministic simulation
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiInstance;
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Role Management Helper
app.get("/api/auth/profile", (req, res) => {
  const currentUserId = (req.query.userId as string) || "user_citizen";
  const user = db.users.find(u => u.id === currentUserId) || db.users[0];
  res.json(user);
});

// Authentication Verification
app.post("/api/auth/verify", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid email or account does not exist." });
  }
});

// Authentication Signup
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password, role, photo } = req.body;
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already in use." });
  }
  const newUser: UserProfile = {
    id: "user_" + email.split("@")[0],
    name,
    email,
    photo: photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    role: role as UserRole,
    points: 0,
    badges: [],
    reportsCount: 0,
    verifiedReports: 0,
    resolvedReports: 0,
    rank: 10,
    trustScore: 50,
  };
  db.users.push(newUser);
  saveDB();
  res.status(201).json(newUser);
});

app.post("/api/auth/profile/update", (req, res) => {
  const updatedUser = req.body;
  const userIdx = db.users.findIndex(u => u.id === updatedUser.id);
  if (userIdx !== -1) {
    db.users[userIdx] = { ...db.users[userIdx], ...updatedUser };
    saveDB();
    res.json(db.users[userIdx]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Issues Endpoints
app.get("/api/issues", (req, res) => {
  // Sort issues by newest
  const sorted = [...db.issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

app.get("/api/issues/:id", (req, res) => {
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }
  
  const comments = db.comments.filter(c => c.issueId === req.params.id);
  const verifications = db.verifications.filter(v => v.issueId === req.params.id);
  
  res.json({
    ...issue,
    comments,
    verifications
  });
});

// Image Analysis, Duplicate Check & Severity Prediction API
app.post("/api/issues/analyze", async (req, res) => {
  const { image, location, deviceInfo, reporterId } = req.body;
  if (!location || location.latitude === undefined || location.longitude === undefined) {
    return res.status(400).json({ error: "GPS Location (Latitude and Longitude) is mandatory for Civic Reports." });
  }

  const reporter = db.users.find(u => u.id === reporterId) || db.users[0];

  // 0. RUN AUTONOMOUS AGENT (Gemini Vision or Simulation if key is missing)
  const ai = getGeminiClient();
  let aiResults: any = null;
  let useSimulation = !ai || !image;

  if (ai && image) {
    try {
      // Decode base64 to parts
      let cleanBase64 = image;
      if (image.startsWith("data:")) {
        cleanBase64 = image.split(",")[1];
      }

      const prompt = `Analyze this image of a civic/urban problem. Provide a structured analysis of the issue.
      Return the output strictly in valid JSON format.
      JSON structure:
      {
        "title": "A short, descriptive, active voice title for the issue",
        "category": "Must be exactly one of: 'Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Tree Fallen', 'Drainage'",
        "description": "Clear detailed description explaining what is seen, where it might be, and visible impact",
        "severity": "Must be exactly one of: 'low', 'medium', 'high', 'critical'",
        "confidenceScore": 80, // Number representing confidence out of 100
        "estimatedSize": "Short size estimation (e.g., '1.5 meters wide' or 'approx 4 bags')",
        "publicRisk": "A clear description of risks (e.g., 'pedestrian falling hazard' or 'damage to tire rims')",
        "suggestedDepartment": "Must be exactly one of: 'Roads Department', 'Municipality', 'Water Board', 'Electricity Department', 'Forest Department', 'Sewer Department'",
        "urgencyReasoning": "Why this severity was chosen, considering schools, hospitals, safety, or damage levels nearby."
      }
      Do not wrap in backticks or add any extra text other than the valid JSON string.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, descriptive, active voice title for the issue"
              },
              category: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Tree Fallen', 'Drainage'"
              },
              description: {
                type: Type.STRING,
                description: "Clear detailed description explaining what is seen, where it might be, and visible impact"
              },
              severity: {
                type: Type.STRING,
                description: "Must be exactly one of: 'low', 'medium', 'high', 'critical'"
              },
              confidenceScore: {
                type: Type.INTEGER,
                description: "Number representing confidence out of 100"
              },
              estimatedSize: {
                type: Type.STRING,
                description: "Short size estimation (e.g., '1.5 meters wide' or 'approx 4 bags')"
              },
              publicRisk: {
                type: Type.STRING,
                description: "A clear description of risks (e.g., 'pedestrian falling hazard' or 'damage to tire rims')"
              },
              suggestedDepartment: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Roads Department', 'Municipality', 'Water Board', 'Electricity Department', 'Forest Department', 'Sewer Department'"
              },
              urgencyReasoning: {
                type: Type.STRING,
                description: "Why this severity was chosen, considering schools, hospitals, safety, or damage levels nearby."
              }
            },
            required: ["title", "category", "description", "severity", "confidenceScore", "estimatedSize", "publicRisk", "suggestedDepartment", "urgencyReasoning"]
          }
        }
      });

      const textOutput = response.text?.trim() || "";
      const parsed = JSON.parse(textOutput);
      if (parsed) {
        aiResults = {
          title: parsed.title,
          category: parsed.category,
          description: parsed.description,
          severity: (parsed.severity?.toLowerCase()) as any,
          confidenceScore: parsed.confidenceScore,
          estimatedSize: parsed.estimatedSize,
          publicRisk: parsed.publicRisk,
          suggestedDepartment: parsed.suggestedDepartment,
          urgencyReasoning: parsed.urgencyReasoning
        };
      } else {
        useSimulation = true;
      }
    } catch (err: any) {
      if (err?.status === 429) {
        console.warn("Gemini Vision quota exceeded, falling back to smart simulation.");
      } else {
        console.error("Gemini Vision processing error, falling back to smart simulation:", err);
      }
      useSimulation = true;
    }
  }

  if (useSimulation || !aiResults) {
    // FALLBACK: User must manually categorize and title if AI fails
    aiResults = {
      title: "",
      category: "Road Damage", // Default to safe category
      description: "Please describe the issue shown in the image.",
      severity: "medium",
      confidenceScore: 0,
      estimatedSize: "N/A",
      publicRisk: "N/A",
      suggestedDepartment: "Municipality",
      urgencyReasoning: "Awaiting user input."
    };
  }

  // 1. DUPLICATE DETECTION (Haversine threshold: 150 meters, AND category match)
  const DUPLICATE_RADIUS_KM = 0.15; // 150m
  const nearbyIssues = db.issues.filter(issue => {
    if (issue.duplicateOfId) return false; // Skip existing duplicates
    const dist = getDistanceKm(location.latitude, location.longitude, issue.location.latitude, issue.location.longitude);
    return dist <= DUPLICATE_RADIUS_KM && issue.status !== "closed" && issue.category === aiResults.category;
  });

  // Keep a reference to potential duplicates
  const potentialDuplicates = nearbyIssues.map(issue => ({
    id: issue.id,
    title: issue.title,
    category: issue.category,
    status: issue.status,
    distanceM: Math.round(getDistanceKm(location.latitude, location.longitude, issue.location.latitude, issue.location.longitude) * 1000)
  }));

  if (potentialDuplicates.length > 0) {
    // Found potential duplicates nearby!
    return res.json({
      duplicateFound: true,
      potentialDuplicates,
      message: "An identical or nearby civic issue already exists in this radius."
    });
  }



  res.json({
    duplicateFound: false,
    analysis: aiResults,
    message: "Image analyzed successfully."
  });
});

// Final Submit Issue (After confirming no duplicate, or choosing to bypass)
app.post("/api/issues/create", (req, res) => {
  const { analysis, location, deviceInfo, reporterId, image } = req.body;
  if (!analysis) return res.status(400).json({ error: "Missing issue analysis data" });

  const reporter = db.users.find(u => u.id === reporterId) || db.users[0];
  
  const newIssue: CivicIssue = {
    id: "issue_" + Date.now(),
    title: analysis.title,
    description: analysis.description,
    category: analysis.category,
    severity: analysis.severity || "medium",
    confidenceScore: analysis.confidenceScore || 85,
    estimatedSize: analysis.estimatedSize,
    publicRisk: analysis.publicRisk,
    suggestedDepartment: analysis.suggestedDepartment,
    department: analysis.suggestedDepartment, // Auto assigned
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || `GPS coordinates (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
    },
    reporterId: reporter.id,
    reporterName: reporter.name,
    image: image || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&h=500&q=80",
    status: "reported",
    timeline: [
      { 
        status: "reported", 
        timestamp: new Date().toISOString(), 
        remarks: `Report submitted. Autonomous department routing mapped to ${analysis.suggestedDepartment}. Urgent verification requests dispatched.` 
      }
    ],
    votes: 1,
    votedUserIds: [reporter.id],
    deviceInfo: deviceInfo || "Web Browser",
    createdAt: new Date().toISOString()
  };

  db.issues.push(newIssue);

  // Award Gamification Points (20 points for valid report submission!)
  reporter.points += 20;
  reporter.reportsCount += 1;
  
  // Track reward
  const rewardId = "reward_" + Date.now();
  db.rewards.push({
    id: rewardId,
    userId: reporter.id,
    pointsEarned: 20,
    action: "Report valid issue",
    description: `Reported '${newIssue.title}'. Passed automated agent vetting.`,
    createdAt: new Date().toISOString()
  });

  // Trigger automated notification for verification to other users
  const activeUsers = db.users.filter(u => u.id !== reporter.id);
  activeUsers.forEach(usr => {
    const dist = getDistanceKm(location.latitude, location.longitude, 37.7749, -122.4194); // Mock distance
    db.notifications.push({
      id: "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      userId: usr.id,
      title: "Help Verify Nearby Issue 📍",
      message: `A new ${newIssue.category} (${newIssue.severity}) was reported in your sector. Tap to verify.`,
      type: "verification",
      read: false,
      createdAt: new Date().toISOString()
    });
  });

  // Also auto-add user notification about reward
  db.notifications.push({
    id: "notif_" + Date.now() + "_reward",
    userId: reporter.id,
    title: "Points Awarded +20! 🎖️",
    message: `You earned 20 points for reporting '${newIssue.title}'.`,
    type: "reward",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  res.status(201).json(newIssue);
});

// Join existing issue (Vouching/Upvoting duplicate instead of creating new)
app.post("/api/issues/:id/join", (req, res) => {
  const { userId } = req.body;
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  if (!issue.votedUserIds.includes(userId)) {
    issue.votedUserIds.push(userId);
    issue.votes += 1;
    saveDB();
  }
  res.json(issue);
});

// Upvote Issue
app.post("/api/issues/:id/vote", (req, res) => {
  const { userId } = req.body;
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  if (issue.votedUserIds.includes(userId)) {
    // Remove vote
    issue.votedUserIds = issue.votedUserIds.filter(id => id !== userId);
    issue.votes = Math.max(0, issue.votes - 1);
  } else {
    // Add vote
    issue.votedUserIds.push(userId);
    issue.votes += 1;
  }

  saveDB();
  res.json({ votes: issue.votes, votedUserIds: issue.votedUserIds });
});

// Community Verification Endpoint
app.post("/api/issues/:id/verify", (req, res) => {
  const { userId, userName, status } = req.body; // status: verified, false_report, already_fixed, need_evidence
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const user = db.users.find(u => u.id === userId) || db.users[0];
  
  // Calculate trust weight based on user's trustScore (trustScore 90 = weight 9, trustScore 50 = weight 5)
  const trustWeight = Math.max(1, Math.floor(user.trustScore / 10));

  const newVerification: VerificationVote = {
    id: "v_" + Date.now(),
    issueId: issue.id,
    userId,
    userName,
    status,
    weight: trustWeight,
    createdAt: new Date().toISOString()
  };

  db.verifications.push(newVerification);

  // Update issue timeline and status if verified by a high-weight user or multiple users
  const verCount = db.verifications.filter(v => v.issueId === issue.id && v.status === "verified").length;
  
  if (status === "verified" && issue.status === "reported") {
    // Auto scale confidence score
    issue.confidenceScore = Math.min(99, issue.confidenceScore + 5);
    
    // If enough verifications, push status to verified
    if (verCount >= 1) {
      issue.status = "verified";
      issue.timeline.push({
        status: "verified",
        timestamp: new Date().toISOString(),
        remarks: `Community verified by ${userName} (Trust Weight: ${trustWeight}). Safe routing is initialized.`
      });

      // Award Points to verifying user (50 points for verifying!)
      user.points += 50;
      user.verifiedReports += 1;
      
      db.rewards.push({
        id: "reward_" + Date.now(),
        userId: user.id,
        pointsEarned: 50,
        action: "Verified issue",
        description: `Verified '${issue.title}' in the community dashboard.`,
        createdAt: new Date().toISOString()
      });

      db.notifications.push({
        id: "notif_" + Date.now(),
        userId: user.id,
        title: "Points Awarded +50! 🎖️",
        message: `You earned 50 points for completing community verification.`,
        type: "reward",
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  } else if (status === "already_fixed" && issue.status !== "resolved" && issue.status !== "closed") {
    issue.status = "resolved";
    issue.timeline.push({
      status: "resolved",
      timestamp: new Date().toISOString(),
      remarks: `Citizen ${userName} confirmed the issue is already resolved on site.`
    });
  } else if (status === "false_report") {
    issue.confidenceScore = Math.max(10, issue.confidenceScore - 15);
  }

  saveDB();
  res.json({ success: true, issue });
});

// Post Comment
app.post("/api/issues/:id/comment", (req, res) => {
  const { userId, userName, text, userPhoto } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text is empty" });

  const newComment: Comment = {
    id: "comment_" + Date.now(),
    issueId: req.params.id,
    userId,
    userName,
    userPhoto: userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    text,
    createdAt: new Date().toISOString()
  };

  db.comments.push(newComment);
  saveDB();
  res.status(201).json(newComment);
});

// Update Issue Status (Officer / Admin workflow)
app.post("/api/issues/:id/status", (req, res) => {
  const { status, remarks, officer, media } = req.body; // status: assigned, in_progress, resolved, closed
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  issue.status = status;
  issue.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    officer,
    remarks,
    media
  });

  // Gamification: If resolved, award points to the original reporter (+100 points!)
  if (status === "resolved") {
    const reporter = db.users.find(u => u.id === issue.reporterId);
    if (reporter) {
      reporter.points += 100;
      reporter.resolvedReports += 1;

      db.rewards.push({
        id: "reward_" + Date.now(),
        userId: reporter.id,
        pointsEarned: 100,
        action: "Resolved reported issue",
        description: `Your reported issue '${issue.title}' was successfully resolved.`,
        createdAt: new Date().toISOString()
      });

      db.notifications.push({
        id: "notif_" + Date.now(),
        userId: reporter.id,
        title: "Issue Resolved! +100 PTS 🏆",
        message: `Your reported issue '${issue.title}' is resolved! 100 points awarded.`,
        type: "reward",
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  saveDB();
  res.json(issue);
});

// Notifications Endpoints
app.get("/api/notifications", (req, res) => {
  const userId = (req.query.userId as string) || "user_citizen";
  const userNotifs = db.notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userNotifs);
});

app.post("/api/notifications/read", (req, res) => {
  const { userId } = req.body;
  db.notifications.forEach(n => {
    if (n.userId === userId) n.read = true;
  });
  saveDB();
  res.json({ success: true });
});

// Leaderboard Endpoint
app.get("/api/leaderboard", (req, res) => {
  // Return sorted contributors by points
  const sorted = [...db.users].sort((a, b) => b.points - a.points);
  res.json(sorted);
});

// Rewards History Endpoint
app.get("/api/rewards", (req, res) => {
  const userId = (req.query.userId as string) || "user_citizen";
  const userRewards = db.rewards
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userRewards);
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const total = db.issues.length;
  const resolved = db.issues.filter(i => i.status === "resolved" || i.status === "closed").length;
  const pending = total - resolved;

  // Department distribution
  const deptMap: Record<string, number> = {};
  // Category distribution
  const catMap: Record<string, number> = {};

  db.issues.forEach(i => {
    const dept = i.department || "Unassigned";
    deptMap[dept] = (deptMap[dept] || 0) + 1;
    
    catMap[i.category] = (catMap[i.category] || 0) + 1;
  });

  const deptDistribution = Object.entries(deptMap).map(([name, count]) => ({ name, count }));
  const categoryDistribution = Object.entries(catMap).map(([name, count]) => ({ name, count }));

  res.json({
    totalReports: total,
    solvedCount: resolved,
    pendingCount: pending,
    averageResolutionDays: 3.1, // Fixed realistic standard average
    deptDistribution,
    categoryDistribution,
    participationRate: 94 // Percent
  });
});

// Predictive Infrastructure Intelligence (Gemini Analyzes historic issues)
app.get("/api/predictions", async (req, res) => {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const issuesSummary = db.issues.map(i => ({
        category: i.category,
        location: i.location.address || `${i.location.latitude},${i.location.longitude}`,
        severity: i.severity,
        status: i.status,
        createdAt: i.createdAt
      }));

      const prompt = `Analyze these reported civic issues for infrastructure failure clusters, water pipe leaks, pothole recurring zones, sewage overflows, etc.
      Historical Issues data: ${JSON.stringify(issuesSummary)}
      
      Generate exactly 3 key predictive infrastructure alerts. Return as a JSON array with these exact properties:
      [
        {
          "id": "pred_a",
          "area": "Specific Street or Intersection or District Name",
          "issueType": "The type of anticipated failure (e.g. 'Water Pipeline Failure')",
          "reportsCount": 15, // estimated reports trigger
          "likelihood": "critical" or "high" or "medium" or "low",
          "recommendation": "A detailed, professional civic prevention recommendation for public works officers",
          "priorityZone": true, // boolean
          "trend": "A description of the timeline pattern (e.g. '+45% increase vs last month')"
        }
      ]
      Provide ONLY the raw JSON block without backticks or surrounding text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Exactly 3 key predictive infrastructure alerts.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { 
                  type: Type.STRING,
                  description: "Unique identifier, e.g. 'pred_a', 'pred_b', 'pred_c'"
                },
                area: { 
                  type: Type.STRING,
                  description: "Specific Street, Intersection, or District Name"
                },
                issueType: { 
                  type: Type.STRING,
                  description: "The type of anticipated failure (e.g. 'Water Pipeline Failure')"
                },
                reportsCount: { 
                  type: Type.INTEGER,
                  description: "Estimated number of reports triggered"
                },
                likelihood: { 
                  type: Type.STRING,
                  description: "Must be exactly one of: 'critical', 'high', 'medium', 'low'"
                },
                recommendation: { 
                  type: Type.STRING,
                  description: "A detailed, professional civic prevention recommendation for public works officers"
                },
                priorityZone: { 
                  type: Type.BOOLEAN,
                  description: "Whether this is a priority zone"
                },
                trend: { 
                  type: Type.STRING,
                  description: "A description of the timeline pattern (e.g. '+45% increase vs last month')"
                }
              },
              required: ["id", "area", "issueType", "reportsCount", "likelihood", "recommendation", "priorityZone", "trend"]
            }
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json(parsed);
      }
    } catch (err: any) {
      if (err?.status === 429) {
        console.warn("Gemini predictive quota exceeded, serving cached defaults.");
      } else {
        console.error("Gemini predictive error, serving cached defaults:", err);
      }
    }
  }

  // Fallback to rich default predictions
  res.json(db.predictions);
});

// AI Civic Chatbot Endpoint (Gemini-powered conversation)
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const ai = getGeminiClient();

  // Create a structured list of our current civic issues database to context-ground the chatbot!
  const currentIssuesContext = db.issues.map(i => {
    return `- [${i.status.toUpperCase()}] '${i.title}' in Category: ${i.category} at ${i.location.address || 'GPS Location'}. Severity: ${i.severity}. Votes: ${i.votes}`;
  }).join("\n");

  const systemInstruction = `You are "CivicHero AI", an elite, autonomous AI Civic Assistant helping citizens and volunteers solve hyperlocal public problems.
  You are warm, empathetic, clear, and action-oriented.
  You have complete access to the current city reports and database:
  ${currentIssuesContext}

  Capabilities:
  1. Grounded context: If asked "why is my issue delayed?" or "what's happening near me?", reference the issues listed above. Mention the status ('reported', 'verified', 'assigned', 'in_progress', 'resolved', 'closed') and notes.
  2. Explain department routing (e.g. Roads Dept, Municipality, Water Board).
  3. Identify dangerous clusters or locations.
  4. Inspire citizens to earn badges (Community Hero, Top Verifier, etc.) and complete verification votes.

  Answer the user's prompt directly, in an elegant, concise markdown format. Avoid technical system terms (like REST APIs or files). Keep it citizen-friendly.`;

  if (ai) {
    try {
      // Map history format
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction
        },
        history: formattedHistory
      });

      const response = await chat.sendMessage({ message });
      return res.json({ text: response.text });
    } catch (err: any) {
      if (err?.status === 429) {
        console.warn("Gemini Chat quota exceeded, falling back to simulated responder.");
      } else {
        console.error("Gemini Chat Error, applying simulated intelligent responder:", err);
      }
    }
  }

  // SIMULATED RESPONDER (if no Gemini API key, matches intent to respond beautifully)
  let reply = "I am ready to help you with civic issues! Here is a list of some local reports:\n\n";
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("delay") || lowerMsg.includes("pothole") || lowerMsg.includes("market")) {
    reply = "Regarding the **Pothole on Market St (High Severity)**: The issue is currently marked **In Progress**. Chief Officer Marcus assigned it to Roads Repair Team 4, and the crew is scheduled to apply hot asphalt patches Friday morning. You can follow the issue timeline on the main map.";
  } else if (lowerMsg.includes("dangerous") || lowerMsg.includes("places") || lowerMsg.includes("leak") || lowerMsg.includes("water")) {
    reply = "There is currently a **Critical Water Pipeline Burst on Haight St**. Neighborhood volunteers verified this with 97% confidence. Water flow is approx 20 gal/min, which might erode standard sidewalk concrete, so please exercise caution when passing Haight St.";
  } else if (lowerMsg.includes("points") || lowerMsg.includes("earn") || lowerMsg.includes("badge")) {
    reply = "You can earn reward points very quickly on CivicHero AI:\n- **20 points** for reporting a valid, AI-approved civic issue.\n- **50 points** for completing community verification votes.\n- **100 points** when an issue you reported gets resolved.\nEarn 100 points to unlock the **Community Hero** badge!";
  } else {
    reply = `I am CivicHero AI, your neighborhood assistant. I see **${db.issues.length} active civic issues** logged.
    
- **Market St Pothole**: In Progress (Asphalt crew scheduled)
- **Haight St Water Leak**: Verified (Critical flow detected)
- **Mission Garbage Dump**: Reported (Municipality sweep pending)

Is there a specific incident you want me to pull details for, or would you like to verify nearby issues to earn points?`;
  }

  res.json({ text: reply });
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CivicHero AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
