import { api } from "./api";
import type {
  AuthTokens,
  User,
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
  ChangeUsernameRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types";

export const authService = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>("/auth/login/json", data);
    return res.data;
  },

  async signup(data: SignupRequest): Promise<User> {
    const res = await api.post<User>("/auth/signup", data);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getProfile(): Promise<User> {
    const res = await api.get<User>("/auth/profile");
    return res.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const res = await api.put<User>("/auth/profile", data);
    return res.data;
  },

  async changeUsername(data: ChangeUsernameRequest): Promise<User> {
    const res = await api.put<User>("/auth/change-username", data);
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put("/auth/change-password", data);
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post("/auth/forgot-password", data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post("/auth/reset-password", data);
  },

  async deleteAccount(): Promise<void> {
    await api.delete("/auth/delete-account");
  },
};
