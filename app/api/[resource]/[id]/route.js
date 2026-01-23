import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { errorMessages } from "@/lib/api_schema";

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

    const itemId = Number(id);
    const item = db[resource].find((i) => i.id === itemId);

    if (!item) {
      return NextResponse.json({ message: errorMessages.ITEM_NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
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

    const itemId = Number(id);
    const itemIndex = db[resource].findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ message: errorMessages.ITEM_NOT_FOUND }, { status: 404 });
    }

    const updates = await request.json();
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ message: errorMessages.INVALID_BODY }, { status: 400 });
    }

    const updatedItem = { ...db[resource][itemIndex], ...updates, id: itemId };
    db[resource][itemIndex] = updatedItem;
    await saveDB(db);

    return NextResponse.json(updatedItem);
  } catch (error) {
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

    const itemId = Number(id);
    const itemIndex = db[resource].findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ message: errorMessages.ITEM_NOT_FOUND }, { status: 404 });
    }

    const deletedItem = db[resource][itemIndex];
    db[resource].splice(itemIndex, 1);
    await saveDB(db);

    return NextResponse.json(deletedItem);
  } catch (error) {
    return NextResponse.json({ message: errorMessages.DELETE_FAILED }, { status: 500 });
  }
};
