import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { comparePassword, generateTokens } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const db = await getDB();
    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const tokens = generateTokens({ id: user.id, email: user.email });
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
