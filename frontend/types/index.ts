// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export type MeetingStatus = "uploaded" | "processing" | "completed" | "failed";

export interface Meeting {
  id: string;
  owner_id: string;
  title: string;
  transcript: string | null;
  original_filename: string | null;
  status: MeetingStatus;
  summary: string | null;
  action_items: string | null;
  decisions: string | null;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
}

export interface CreateMeetingPayload {
  title: string;
}

export interface UpdateMeetingPayload {
  title?: string;
  transcript?: string;
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────

export interface AnalysisResponse {
  meeting_id: string;
  summary: string;
  action_items: string;
  decisions: string;
  analyzed_at: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  status?: number;
}

export type LoadingState = "idle" | "loading" | "success" | "error";
