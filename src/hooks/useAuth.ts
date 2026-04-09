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
import Cookies from "js-cookie";

export function useProfile() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const tokens = await authService.login(data);
      // Store refresh token in httpOnly cookie via server route
      await fetch("/api/auth/set-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });
      return tokens;
    },
    onSuccess: async (tokens) => {
      const user = await authService.getProfile();
      setAuth(user, tokens.access_token);
      qc.setQueryData(["user"], user);
      toast.success(`Welcome back, ${user.full_name || 'there'}!`);
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Login failed");
    },
  });
}

export function useSignup() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: () => {
      toast.success("Account created! Please log in.");
      router.push("/login");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Signup failed");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout().catch(() => {});
      await fetch("/api/auth/set-refresh", { method: "DELETE" });
    },
    onSettled: () => {
      clearAuth();
      qc.clear();
      router.push("/login");
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
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: authService.deleteAccount,
    onSuccess: () => {
      clearAuth();
      Cookies.remove("auth_token");
      router.push("/");
      toast.success("Account deleted.");
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
