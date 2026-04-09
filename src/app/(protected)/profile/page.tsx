"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile, useChangePassword, useResetAccount, useDeleteAccount } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const profileSchema = z.object({
  full_name: z.string().optional(),
});
type ProfileData = z.infer<typeof profileSchema>;

const usernameSchema = z.object({
  new_username: z.string().min(3, "Username must be at least 3 characters"),
});
type UsernameData = z.infer<typeof usernameSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password required"),
  new_password: z.string().min(6, "Must be at least 6 characters"),
});
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changeUsername, isPending: changingUsername } = useChangeUsername();
  const { mutate: changePassword, isPending: changingPw } = useChangePassword();
  const { mutate: resetAccount, isPending: resetting } = useResetAccount();
  const { mutate: deleteAccount, isPending: deleting } = useDeleteAccount();

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const usernameForm = useForm<UsernameData>({ resolver: zodResolver(usernameSchema) });
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
        <Card className="rounded-[2rem] border-0 shadow-soft">
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

        <Card className="rounded-[2rem] border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Change Username</CardTitle>
            <CardDescription>Update your public username.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={usernameForm.handleSubmit((data) => changeUsername(data))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_username">New Username</Label>
                <Input id="new_username" {...usernameForm.register("new_username")} />
                {usernameForm.formState.errors.new_username && (
                  <p className="text-sm text-destructive">{usernameForm.formState.errors.new_username.message}</p>
                )}
              </div>
              <Button type="submit" disabled={changingUsername}>
                {changingUsername ? "Updating..." : "Change Username"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-soft">
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

        <Card className="rounded-[2rem] border-0 shadow-soft border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Actions that cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/10 rounded-2xl bg-destructive/5">
              <div>
                <p className="font-medium">Reset Account</p>
                <p className="text-sm text-muted-foreground">Clear all your cards, assets and data.</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-white rounded-xl">
                    Reset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action will permanently delete all your cards, assets, and design data. This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => {}}>Cancel</Button>
                    <Button variant="destructive" onClick={() => resetAccount()} disabled={resetting}>
                      {resetting ? "Resetting..." : "Confirm Reset"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/10 rounded-2xl bg-destructive/5">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="rounded-xl">
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete your account?</DialogTitle>
                    <DialogDescription>
                      This is a permanent action. All your data will be wiped from our servers forever.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteAccount()} disabled={deleting}>
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
