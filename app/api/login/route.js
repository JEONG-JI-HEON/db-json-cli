import { NextResponse } from "next/server";

import { errorMessages } from "@/lib/api_schema";
import { comparePassword, generateTokens } from "@/lib/auth";
import { getDB } from "@/lib/db";

export const POST = async (request) => {
  try {
    const { email, password } = await request.json();

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json({ message: errorMessages.EMAIL_PASSWORD_REQUIRED }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: errorMessages.INVALID_EMAIL_FORMAT }, { status: 422 });
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

    return NextResponse.json({
      ...tokens,
      userInfo: {
        id: user.id,
        email: user.email,
        name: user.name || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // JSON 파싱 에러
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    // 데이터베이스 에러
    if (error.message?.includes("database") || error.message?.includes("DB")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.LOGIN_FAILED }, { status: 500 });
  }
};
