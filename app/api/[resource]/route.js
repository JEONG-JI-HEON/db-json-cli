import { NextResponse } from "next/server";

import { errorMessages } from "@/lib/api_schema";
import { authMiddleware } from "@/lib/auth";
import { getDB, saveDB } from "@/lib/db";

export const GET = async (request, { params }) => {
  try {
    const { resource } = params;
    const db = await getDB();

    if (!db[resource]) {
      return NextResponse.json({ message: errorMessages.RESOURCE_NOT_FOUND }, { status: 404 });
    }

    const isPrivate = db.rules?.[resource] === "private";
    if (isPrivate) {
      const user = authMiddleware(request);
      if (!user) {
        return NextResponse.json({ message: errorMessages.NO_TOKEN }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let data = db[resource];

    // 쿼리 파라미터 검증
    if (from || to) {
      const fromNum = from ? Number(from) : null;
      const toNum = to ? Number(to) : null;

      if ((from && isNaN(fromNum)) || (to && isNaN(toNum))) {
        return NextResponse.json({ message: errorMessages.INVALID_QUERY_PARAMS }, { status: 400 });
      }

      if (fromNum !== null && toNum !== null && fromNum > toNum) {
        return NextResponse.json({ message: errorMessages.INVALID_QUERY_PARAMS }, { status: 400 });
      }

      if (fromNum !== null && toNum !== null) {
        data = data.filter((item) => item.id >= fromNum && item.id <= toNum);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET resource error:", error);

    if (error.message?.includes("database") || error.message?.includes("DB")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.FETCH_FAILED }, { status: 500 });
  }
};

export const POST = async (request, { params }) => {
  try {
    const { resource } = params;
    const db = await getDB();

    if (!db[resource]) {
      return NextResponse.json({ message: errorMessages.RESOURCE_NOT_FOUND }, { status: 404 });
    }

    const isPrivate = db.rules?.[resource] === "private";
    if (isPrivate) {
      const user = authMiddleware(request);
      if (!user) {
        return NextResponse.json({ message: errorMessages.NO_TOKEN }, { status: 401 });
      }
    }

    const newItem = await request.json();

    // 요청 본문 검증
    if (!newItem || typeof newItem !== "object" || Array.isArray(newItem)) {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    // 빈 객체 검증
    if (Object.keys(newItem).length === 0) {
      return NextResponse.json({ message: errorMessages.MISSING_REQUIRED_FIELDS }, { status: 422 });
    }

    // 페이로드 크기 검증 (예: 1MB)
    const payloadSize = JSON.stringify(newItem).length;
    if (payloadSize > 1024 * 1024) {
      return NextResponse.json({ message: errorMessages.PAYLOAD_TOO_LARGE }, { status: 413 });
    }

    const id = db[resource].length ? Math.max(...db[resource].map((i) => i.id)) + 1 : 1;
    const item = { id, ...newItem };

    db[resource].push(item);
    await saveDB(db);

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST resource error:", error);

    // JSON 파싱 에러
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    // 데이터베이스 에러
    if (error.message?.includes("database") || error.message?.includes("DB") || error.message?.includes("save")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.CREATE_FAILED }, { status: 500 });
  }
};
