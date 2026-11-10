"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLogin } from "@/hooks/useAuth";
import { getErrorMessage } from "@/services/api";
import { FormError, FormField, authInput } from "./FormField";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending, error, reset } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((data) => login(data))} onChange={() => error && reset()} className="space-y-5" noValidate>
      <FormError message={error ? getErrorMessage(error) : null} />

      <FormField id="email" label="Email or username" error={errors.email?.message}>
        <Input
          id="email"
          autoComplete="username"
          placeholder="you@example.com"
          autoFocus
          className={authInput}
          aria-invalid={!!errors.email}
          disabled={isPending}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        action={
          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className={authInput}
          aria-invalid={!!errors.password}
          disabled={isPending}
          {...register("password")}
        />
      </FormField>

      <Button type="submit" className="h-11 w-full text-sm" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : null}
        {isPending ? "Signing in…" : "Sign in"}
        {!isPending && <ArrowRight />}
      </Button>
    </form>
  );
}
