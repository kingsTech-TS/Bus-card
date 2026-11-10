"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  LoginRequest, SignupRequest, UpdateProfileRequest,
  ChangeUsernameRequest, ChangePasswordRequest,
} from "@/types";

export function useProfile() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

/** Log in, store the refresh token in an httpOnly cookie and load the profile. */
async function signIn(data: LoginRequest) {
  const tokens = await authService.login({ ...data, email: data.email.trim() });
  await fetch("/api/auth/set-refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: tokens.refresh_token }),
  });
  useAuthStore.getState().setAccessToken(tokens.access_token);
  const user = await authService.getProfile();
  useAuthStore.getState().setAuth(user, tokens.access_token);
  return user;
}

export const displayName = (u?: { full_name?: string | null; username?: string | null; email?: string } | null) =>
  u?.full_name || u?.username || u?.email?.split("@")[0] || "there";

export function useLogin() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (user) => {
      qc.setQueryData(["profile"], user);
      toast.success(`Welcome back, ${displayName(user)}!`);
      router.push("/dashboard");
    },
  });
}

/** Create the account, then sign straight in. */
export function useSignup() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const payload = { ...data, email: data.email.trim().toLowerCase(), username: data.username.trim().toLowerCase() };
      await authService.signup({ ...payload, full_name: payload.full_name || payload.username });
      return signIn({ email: payload.email, password: data.password });
    },
    onSuccess: (user) => {
      qc.setQueryData(["profile"], user);
      toast.success(`Welcome to BusCard, ${displayName(user)}!`);
      router.push("/dashboard");
    },
  });
}

/**
 * End the session locally first (so no in-flight 401 can trigger a token refresh
 * that re-creates the cookies), tell the backend best-effort, then hard-navigate
 * so the proxy sees the cleared cookies and the client router cache is discarded.
 */
async function endSession(qc: ReturnType<typeof useQueryClient>, notifyBackend: boolean) {
  const token = useAuthStore.getState().accessToken;
  useAuthStore.getState().clearAuth();
  await qc.cancelQueries();
  qc.clear();
  await Promise.allSettled([
    notifyBackend && token ? authService.logout(token) : Promise.resolve(),
    fetch("/api/auth/set-refresh", { method: "DELETE" }),
  ]);
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => endSession(qc, true),
    onSettled: () => {
      window.location.replace("/login");
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (user) => {
      qc.setQueryData(["profile"], user);
      toast.success("Profile updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useChangeUsername() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangeUsernameRequest) => authService.changeUsername(data),
    onSuccess: (user) => {
      qc.setQueryData(["profile"], user);
      toast.success("Username changed!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => toast.success("Password changed!"),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword({ email }),
    onSuccess: () => toast.success("Reset email sent — check your inbox."),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: { token: string; new_password: string }) =>
      authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset! Please log in.");
      router.push("/login");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.deleteAccount,
    onSuccess: async () => {
      await endSession(qc, false);
      window.location.replace("/");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useResetAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.resetAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["templates"] });
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Account reset! All your data has been cleared.");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
