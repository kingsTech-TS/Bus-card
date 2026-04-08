"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "@/hooks/useAuth";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { mutate: signup, isPending } = useSignup();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => signup(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} disabled={isPending} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>


      
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name (Optional)</Label>
        <Input id="full_name" {...register("full_name")} disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} disabled={isPending} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
