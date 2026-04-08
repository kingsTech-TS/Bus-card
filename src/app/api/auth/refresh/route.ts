import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://b-card-u68j.onrender.com";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh failed from backend");

    const data = await res.json();
    
    // Set new refresh token back into cookie
    if (data.refresh_token) {
      cookieStore.set({
        name: "refresh_token",
        value: data.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return NextResponse.json({ access_token: data.access_token });
  } catch (error: any) {
    // Clear cookie on failure
    cookieStore.delete("refresh_token");
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
