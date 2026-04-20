import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import type {
  PushNotificationSettings,
  PushSubscriptionInput,
  UpdatePushNotificationSettingsInput,
} from "@/app/types";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ensurePromotedUser } from "@/lib/auth/ensurePromotedUser";
import {
  deletePushSubscription,
  getPushNotificationSettings,
  isWebPushConfigured,
  updatePushNotificationSettings,
  upsertPushSubscription,
} from "@/lib/push-notifications";

type PushSubscriptionDeleteInput = {
  endpoint?: string;
};

async function requireExistingUser(userId: string): Promise<boolean> {
  await ensurePromotedUser();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return Boolean(user);
}

function isValidPushSubscriptionInput(input: PushSubscriptionInput): boolean {
  return Boolean(
    input.endpoint &&
      input.keys?.auth &&
      input.keys?.p256dh,
  );
}

function isValidPushNotificationSettingsInput(
  input: UpdatePushNotificationSettingsInput,
): boolean {
  return typeof input.todoNotificationsEnabled === "boolean" && typeof input.tipNotificationsEnabled === "boolean";
}

export async function GET(): Promise<NextResponse<PushNotificationSettings | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  try {
    const userExists = await requireExistingUser(userId);

    if (!userExists) {
      return NextResponse.json({ error: "Skapa din profil innan du aktiverar pushnotiser." }, { status: 404 });
    }

    const settings = await getPushNotificationSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    logger.error("Failed to fetch push notification settings", { userId });
    Sentry.captureException(error, { tags: { route: "GET /api/notifications/push-subscription" } });
    return NextResponse.json({ error: "Det gick inte att hämta pushinställningarna." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<PushNotificationSettings | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  if (!isWebPushConfigured()) {
    return NextResponse.json({ error: "Pushnotiser är inte konfigurerade på servern ännu." }, { status: 503 });
  }

  const input = (await request.json()) as PushSubscriptionInput;

  if (!isValidPushSubscriptionInput(input)) {
    return NextResponse.json({ error: "Ogiltig push subscription." }, { status: 400 });
  }

  try {
    const userExists = await requireExistingUser(userId);

    if (!userExists) {
      return NextResponse.json({ error: "Skapa din profil innan du aktiverar pushnotiser." }, { status: 404 });
    }

    await upsertPushSubscription(userId, input);
    const settings = await getPushNotificationSettings(userId);

    return NextResponse.json(settings, { status: 201 });
  } catch (error) {
    logger.error("Failed to save push subscription", { userId, endpoint: input.endpoint });
    Sentry.captureException(error, { tags: { route: "POST /api/notifications/push-subscription" } });
    return NextResponse.json({ error: "Det gick inte att spara pushnotiserna." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<PushNotificationSettings | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  const input = (await request.json()) as PushSubscriptionDeleteInput;

  if (!input.endpoint) {
    return NextResponse.json({ error: "Endpoint krävs för att kunna stänga av pushnotiser på enheten." }, { status: 400 });
  }

  try {
    const userExists = await requireExistingUser(userId);

    if (!userExists) {
      return NextResponse.json({ error: "Skapa din profil innan du ändrar pushnotiser." }, { status: 404 });
    }

    await deletePushSubscription(userId, input.endpoint);
    const settings = await getPushNotificationSettings(userId);

    return NextResponse.json(settings);
  } catch (error) {
    logger.error("Failed to delete push subscription", { userId, endpoint: input.endpoint });
    Sentry.captureException(error, { tags: { route: "DELETE /api/notifications/push-subscription" } });
    return NextResponse.json({ error: "Det gick inte att stänga av pushnotiserna." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
): Promise<NextResponse<PushNotificationSettings | { error: string }>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Inte autentiserad." }, { status: 401 });
  }

  const input = (await request.json()) as UpdatePushNotificationSettingsInput;

  if (!isValidPushNotificationSettingsInput(input)) {
    return NextResponse.json({ error: "Ogiltiga notisinställningar." }, { status: 400 });
  }

  try {
    const userExists = await requireExistingUser(userId);

    if (!userExists) {
      return NextResponse.json({ error: "Skapa din profil innan du ändrar pushnotiser." }, { status: 404 });
    }

    await updatePushNotificationSettings(userId, input);
    const settings = await getPushNotificationSettings(userId);

    return NextResponse.json(settings);
  } catch (error) {
    logger.error("Failed to update push notification settings", { userId });
    Sentry.captureException(error, { tags: { route: "PATCH /api/notifications/push-subscription" } });
    return NextResponse.json({ error: "Det gick inte att spara notisinställningarna." }, { status: 500 });
  }
}