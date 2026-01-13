import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { hashPassword, generateTokens } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email/password required" }, { status: 400 });
    }

    const db = await getDB();
    const exists = db.users.find((u) => u.email === email);

    if (exists) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const id = db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const newUser = { id, email, name: name || "", password: hashed };

    db.users.push(newUser);
    await saveDB(db);

    const tokens = generateTokens({ id, email });
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
