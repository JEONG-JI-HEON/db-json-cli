import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { comparePassword, generateTokens } from "@/lib/auth";
import { errorMessages } from "@/lib/api_schema";

export const POST = async (request) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: errorMessages.EMAIL_PASSWORD_REQUIRED }, { status: 400 });
    }

    const db = await getDB();
    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ message: errorMessages.INVALID_CREDENTIALS }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      return NextResponse.json({ message: errorMessages.INVALID_CREDENTIALS }, { status: 401 });
    }

    const tokens = generateTokens({ id: user.id, email: user.email });
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json({ message: errorMessages.LOGIN_FAILED }, { status: 500 });
  }
};
