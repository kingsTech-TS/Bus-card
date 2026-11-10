"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/services/api";
import { AuthHeading, FormError, FormField, authInput } from "@/components/auth/FormField";

const schema = z
  .object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" />
        </span>
        <AuthHeading title="Link invalid or expired" description="Request a new password reset link to continue." />
        <Button nativeButton={false} render={<Link href="/forgot-password" />} className="h-11 w-full">
          Request a new link
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ token, new_password: data.new_password });
      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthHeading title="Set a new password" description="Choose a strong password you haven't used before." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={error} />
        <FormField id="new_password" label="New password" error={errors.new_password?.message}>
          <PasswordInput
            id="new_password"
            autoComplete="new-password"
            placeholder="Create a password"
            autoFocus
            className={authInput}
            aria-invalid={!!errors.new_password}
            disabled={isLoading}
            {...register("new_password")}
          />
        </FormField>
        <FormField id="confirm_password" label="Confirm password" error={errors.confirm_password?.message}>
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className={authInput}
            aria-invalid={!!errors.confirm_password}
            disabled={isLoading}
            {...register("confirm_password")}
          />
        </FormField>
        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          {isLoading ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
