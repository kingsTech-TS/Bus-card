import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();
    if (!refresh_token) {
      return NextResponse.json({ error: "Missing refresh_token" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: "refresh_token",
      value: refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("refresh_token");
  return NextResponse.json({ success: true });
}
