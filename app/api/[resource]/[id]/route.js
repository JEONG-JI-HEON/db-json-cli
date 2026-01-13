import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { resource, id } = params;
    const db = await getDB();

    if (!db[resource]) {
      return NextResponse.json({ message: "Resource not found" }, { status: 404 });
    }

    // Check if private
    const isPrivate = db.rules?.[resource] === "private";
    if (isPrivate) {
      const user = authMiddleware(request);
      if (!user) {
        return NextResponse.json({ message: "No token" }, { status: 401 });
      }
    }

    const itemId = Number(id);
    const item = db[resource].find((i) => i.id === itemId);

    if (!item) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch item" }, { status: 500 });
  }
}
