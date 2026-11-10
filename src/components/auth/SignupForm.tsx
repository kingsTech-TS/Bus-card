"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, AtSign, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { useSignup } from "@/hooks/useAuth";
import { getErrorMessage } from "@/services/api";
import { FormError, FormField, authInput } from "./FormField";

// Mirrors the backend rule in app/schemas/user.py
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._]{1,28}[a-zA-Z0-9])$/;

const signupSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer")
      .regex(USERNAME_RE, "Use letters, numbers, dots or underscores (not at the start or end)"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Upper & lowercase", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH = [
  { label: "Too weak", color: "bg-destructive" },
  { label: "Weak", color: "bg-orange-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = RULES.filter((r) => r.test(password)).length;
  const level = STRENGTH[passed];
  return (
    <div className="space-y-2 pt-1" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {RULES.map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full bg-muted transition-colors", i < passed && level.color)} />
          ))}
        </div>
        <span className="w-14 text-right text-xs font-medium text-muted-foreground">{level.label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.label} className={cn("flex items-center gap-1.5 text-xs", ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
              <Check className={cn("size-3", !ok && "opacity-30")} />
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SignupForm() {
  const { mutate: signup, isPending, error, reset } = useSignup();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema), mode: "onTouched" });

  const password = useWatch({ control, name: "password" }) ?? "";

  return (
    <form
      onSubmit={handleSubmit(({ email, username, password }) => signup({ email, username, password }))}
      onChange={() => error && reset()}
      className="space-y-5"
      noValidate
    >
      <FormError message={error ? getErrorMessage(error) : null} />

      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
          className={authInput}
          aria-invalid={!!errors.email}
          disabled={isPending}
          {...register("email")}
        />
      </FormField>

      <FormField id="username" label="Username" error={errors.username?.message} hint="3–30 characters. Letters, numbers, dots and underscores.">
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="janedoe"
            className={cn(authInput, "pl-9")}
            aria-invalid={!!errors.username}
            disabled={isPending}
            {...register("username")}
          />
        </div>
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Create a password"
          className={authInput}
          aria-invalid={!!errors.password}
          disabled={isPending}
          {...register("password")}
        />
        <PasswordStrength password={password} />
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          className={authInput}
          aria-invalid={!!errors.confirmPassword}
          disabled={isPending}
          {...register("confirmPassword")}
        />
      </FormField>

      <Button type="submit" className="h-11 w-full text-sm" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : null}
        {isPending ? "Creating your account…" : "Create account"}
        {!isPending && <ArrowRight />}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
