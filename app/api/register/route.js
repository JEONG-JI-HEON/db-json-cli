import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { hashPassword, generateTokens } from "@/lib/auth";
import { errorMessages } from "@/lib/api_schema";

export const POST = async (request) => {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: errorMessages.EMAIL_PASSWORD_REQUIRED }, { status: 400 });
    }

    const db = await getDB();
    const exists = db.users.find((u) => u.email === email);

    if (exists) {
      return NextResponse.json({ message: errorMessages.USER_ALREADY_EXISTS }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const id = db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const newUser = { id, email, name: name || "", password: hashed };

    db.users.push(newUser);
    await saveDB(db);

    const tokens = generateTokens({ id, email });
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json({ message: errorMessages.REGISTER_FAILED }, { status: 500 });
  }
};
