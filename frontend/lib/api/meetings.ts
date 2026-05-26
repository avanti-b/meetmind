import { apiClient } from "./client";
import type {
  Meeting,
  MeetingListResponse,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  AnalysisResponse,
} from "@/types";

export const meetingsApi = {
  list: () =>
    apiClient.get<MeetingListResponse>("/meetings").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Meeting>(`/meetings/${id}`).then((r) => r.data),

  create: (payload: CreateMeetingPayload) =>
    apiClient.post<Meeting>("/meetings", payload).then((r) => r.data),

  update: (id: string, payload: UpdateMeetingPayload) =>
    apiClient.put<Meeting>(`/meetings/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/meetings/${id}`).then((r) => r.data),

  uploadTranscript: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<Meeting>(`/meetings/${id}/transcript`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  analyze: (id: string) =>
    apiClient.post<AnalysisResponse>(`/meetings/${id}/analyze`).then((r) => r.data),
};
