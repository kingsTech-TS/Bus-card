"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/useAuth";

const profileSchema = z.object({
  full_name: z.string().optional(),
});
type ProfileData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password required"),
  new_password: z.string().min(6, "Must be at least 6 characters"),
});
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPw } = useChangePassword();

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const pwForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  // Update profile form defaults when user loads
  if (user && !profileForm.getValues("full_name")) {
    profileForm.reset({ full_name: user.full_name || "" });
  }

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile Settings" description="Manage your account details and security." />

      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your public facing details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit((data) => updateProfile(data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...profileForm.register("full_name")} />
              </div>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={pwForm.handleSubmit((data) => changePassword(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" {...pwForm.register("current_password")} />
                {pwForm.formState.errors.current_password && (
                  <p className="text-sm text-destructive">{pwForm.formState.errors.current_password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" {...pwForm.register("new_password")} />
              </div>
              <Button type="submit" variant="secondary" disabled={changingPw}>
                {changingPw ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
