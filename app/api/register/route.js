import { NextResponse } from "next/server";

import { errorMessages } from "@/lib/api_schema";
import { generateTokens, hashPassword } from "@/lib/auth";
import { getDB, saveDB } from "@/lib/db";

export const POST = async (request) => {
  try {
    const { email, password, name } = await request.json();

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json({ message: errorMessages.EMAIL_PASSWORD_REQUIRED }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: errorMessages.INVALID_EMAIL_FORMAT }, { status: 422 });
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      return NextResponse.json({ message: errorMessages.PASSWORD_TOO_SHORT }, { status: 422 });
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

    return NextResponse.json({
      ...tokens,
      userInfo: {
        id,
        email,
        name: name || "",
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // JSON 파싱 에러
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    // 데이터베이스 에러
    if (error.message?.includes("database") || error.message?.includes("DB") || error.message?.includes("save")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.REGISTER_FAILED }, { status: 500 });
  }
};
