import { NextRequest, NextResponse } from "next/server";

import type { PushSubscriptionRecord } from "@/app/types";
import { readDb, writeDb } from "@/server/db";

type PushSubscriptionPayload = {
  subscription?: PushSubscriptionJSON;
};

function toSubscriptionRecord(
  subscription: PushSubscriptionJSON,
  userAgent?: string | null,
): PushSubscriptionRecord | null {
  if (!subscription.endpoint || !subscription.keys?.auth || !subscription.keys?.p256dh) {
    return null;
  }

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
    },
    createdAt: new Date().toISOString(),
    userAgent: userAgent ?? undefined,
  };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const payload = (await request.json()) as PushSubscriptionPayload;
    const record = toSubscriptionRecord(payload.subscription ?? {}, request.headers.get("user-agent"));

    if (!record) {
      return NextResponse.json({ error: "Ogiltig push-subscription." }, { status: 400 });
    }

    const db = await readDb();
    const existingIndex = db.pushSubscriptions.findIndex(
      (subscription) => subscription.endpoint === record.endpoint,
    );

    if (existingIndex >= 0) {
      db.pushSubscriptions[existingIndex] = record;
    } else {
      db.pushSubscriptions.push(record);
    }

    await writeDb(db);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Kunde inte spara pushnotis-inställningen." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const payload = (await request.json()) as PushSubscriptionPayload;
    const endpoint = payload.subscription?.endpoint;

    if (!endpoint) {
      return NextResponse.json({ error: "Kunde inte hitta subscription att ta bort." }, { status: 400 });
    }

    const db = await readDb();
    const nextSubscriptions = db.pushSubscriptions.filter(
      (subscription) => subscription.endpoint !== endpoint,
    );

    await writeDb({
      ...db,
      pushSubscriptions: nextSubscriptions,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Kunde inte ta bort pushnotis-inställningen." },
      { status: 500 },
    );
  }
}