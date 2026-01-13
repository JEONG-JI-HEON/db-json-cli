import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();
    const routeList = [];

    Object.keys(db).forEach((key) => {
      if (["users", "rules"].includes(key)) return;
      const isPrivate = db.rules?.[key] === "private";
      routeList.push({
        key,
        count: db[key].length,
        permission: isPrivate ? "private" : "public",
      });
    });

    return NextResponse.json({
      routeList,
      port: process.env.PORT || 4000,
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load DB info" }, { status: 500 });
  }
}
