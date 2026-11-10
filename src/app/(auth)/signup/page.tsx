import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthHeading } from "@/components/auth/FormField";

export const metadata: Metadata = { title: "Create account · BusCard" };

export default function SignupPage() {
  return (
    <>
      <AuthHeading
        title="Create your account"
        description={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      />
      <SignupForm />
    </>
  );
}
