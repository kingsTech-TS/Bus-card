"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/services/api";
import { AuthHeading, FormError, FormField, authInput } from "@/components/auth/FormField";

const schema = z.object({ email: z.email("Enter a valid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data);
      setSentTo(data.email);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="size-7" />
        </span>
        <AuthHeading
          title="Check your email"
          description={<>If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, you&apos;ll get a link to reset your password.</>}
        />
        <Button nativeButton={false} render={<Link href="/login" />} variant="outline" className="h-11 w-full">
          <ArrowLeft /> Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
      <AuthHeading title="Forgot your password?" description="Enter the email you signed up with and we'll send you a reset link." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={error} />
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            autoFocus
            className={authInput}
            aria-invalid={!!errors.email}
            disabled={isLoading}
            {...register("email")}
          />
        </FormField>
        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          {isLoading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </>
  );
}
