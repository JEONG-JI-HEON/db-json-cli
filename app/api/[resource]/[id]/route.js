import { NextResponse } from "next/server";

import { errorMessages } from "@/lib/api_schema";
import { authMiddleware } from "@/lib/auth";
import { getDB, saveDB } from "@/lib/db";

export const GET = async (request, { params }) => {
  try {
    const { resource, id } = params;
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

    // ID 형식 검증
    const itemId = Number(id);
    if (isNaN(itemId) || itemId < 1) {
      return NextResponse.json({ message: errorMessages.INVALID_ID_FORMAT }, { status: 400 });
    }

    const item = db[resource].find((i) => i.id === itemId);

    if (!item) {
      return NextResponse.json({ message: errorMessages.ITEM_NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET resource by ID error:", error);

    if (error.message?.includes("database") || error.message?.includes("DB")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.FETCH_FAILED }, { status: 500 });
  }
};

export const PUT = async (request, { params }) => {
  try {
    const { resource, id } = params;
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

    // ID 형식 검증
    const itemId = Number(id);
    if (isNaN(itemId) || itemId < 1) {
      return NextResponse.json({ message: errorMessages.INVALID_ID_FORMAT }, { status: 400 });
    }

    const itemIndex = db[resource].findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ message: errorMessages.ITEM_NOT_FOUND }, { status: 404 });
    }

    const updates = await request.json();

    // 요청 본문 검증
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    // 빈 객체 검증
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: errorMessages.MISSING_REQUIRED_FIELDS }, { status: 422 });
    }

    // 페이로드 크기 검증
    const payloadSize = JSON.stringify(updates).length;
    if (payloadSize > 1024 * 1024) {
      return NextResponse.json({ message: errorMessages.PAYLOAD_TOO_LARGE }, { status: 413 });
    }

    const updatedItem = { ...db[resource][itemIndex], ...updates, id: itemId };
    db[resource][itemIndex] = updatedItem;
    await saveDB(db);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("PUT resource error:", error);

    // JSON 파싱 에러
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    // 데이터베이스 에러
    if (error.message?.includes("database") || error.message?.includes("DB") || error.message?.includes("save")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.UPDATE_FAILED }, { status: 500 });
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const { resource, id } = params;
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

    // ID 형식 검증
    const itemId = Number(id);
    if (isNaN(itemId) || itemId < 1) {
      return NextResponse.json({ message: errorMessages.INVALID_ID_FORMAT }, { status: 400 });
    }

    const itemIndex = db[resource].findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ message: errorMessages.ITEM_NOT_FOUND }, { status: 404 });
    }

    const deletedItem = db[resource][itemIndex];
    db[resource].splice(itemIndex, 1);
    await saveDB(db);

    return NextResponse.json(deletedItem);
  } catch (error) {
    console.error("DELETE resource error:", error);

    // 데이터베이스 에러
    if (error.message?.includes("database") || error.message?.includes("DB") || error.message?.includes("save")) {
      return NextResponse.json({ message: errorMessages.DATABASE_ERROR }, { status: 500 });
    }

    return NextResponse.json({ message: errorMessages.DELETE_FAILED }, { status: 500 });
  }
};
