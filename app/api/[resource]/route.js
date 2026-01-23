import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { errorMessages } from "@/lib/api_schema";

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
    if (from && to) {
      const fromNum = Number(from);
      const toNum = Number(to);
      data = data.filter((item) => item.id >= fromNum && item.id <= toNum);
    }

    return NextResponse.json(data);
  } catch (error) {
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
    if (!newItem || typeof newItem !== "object") {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    const id = db[resource].length ? Math.max(...db[resource].map((i) => i.id)) + 1 : 1;
    const item = { id, ...newItem };

    db[resource].push(item);
    await saveDB(db);

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: errorMessages.CREATE_FAILED }, { status: 500 });
  }
};
