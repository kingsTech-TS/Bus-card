import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthHeading } from "@/components/auth/FormField";

export const metadata: Metadata = { title: "Sign in · BusCard" };

export default function LoginPage() {
  return (
    <>
      <AuthHeading
        title="Welcome back"
        description={
          <>
            New to BusCard?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        }
      />
      <LoginForm />
    </>
  );
}
