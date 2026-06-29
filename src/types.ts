export type UserRole = "Citizen" | "Volunteer" | "Moderator" | "Department Officer" | "Administrator" | "Super Admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: UserRole;
  points: number;
  badges: string[];
  reportsCount: number;
  verifiedReports: number;
  resolvedReports: number;
  rank: number;
  trustScore: number; // For verification weight (1-100)
}

export type IssueStatus = "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "closed";

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface TimelineEvent {
  status: IssueStatus;
  timestamp: string;
  officer?: string;
  remarks: string;
  media?: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  confidenceScore: number;
  estimatedSize?: string;
  publicRisk?: string;
  suggestedDepartment: string;
  department?: string;
  location: LocationData;
  reporterId: string;
  reporterName: string;
  image: string;
  status: IssueStatus;
  timeline: TimelineEvent[];
  votes: number;
  votedUserIds: string[];
  duplicateOfId?: string; // If this is a duplicate, points to the original issue
  deviceInfo?: string;
  createdAt: string;
}

export interface VerificationVote {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  status: "verified" | "false_report" | "already_fixed" | "need_evidence";
  weight: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "verification" | "update" | "badge" | "reward";
  read: boolean;
  createdAt: string;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  pointsEarned: number;
  action: string;
  description: string;
  createdAt: string;
}

export interface InfrastructurePrediction {
  id: string;
  area: string;
  issueType: string;
  reportsCount: number;
  likelihood: "low" | "medium" | "high" | "critical";
  recommendation: string;
  priorityZone: boolean;
  trend: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
