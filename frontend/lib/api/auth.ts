import { apiClient } from "./client";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "@/types";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<TokenResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),
};
