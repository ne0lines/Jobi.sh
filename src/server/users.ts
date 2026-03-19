import { promises as fs } from "node:fs";
import path from "node:path";

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import type { AppUser, UsersDb } from "@/app/types";

const usersFilePath = path.join(process.cwd(), "src/server/users.json");

function normalizeUsersDb(data: UsersDb): UsersDb {
  return {
    users: (data.users ?? []).map((user) => ({
      ...user,
      email: user.email ?? (user as AppUser & { username?: string }).username ?? "",
    })),
  };
}

export async function readUsersDb(): Promise<UsersDb> {
  try {
    const raw = await fs.readFile(usersFilePath, "utf8");
    return normalizeUsersDb(JSON.parse(raw) as UsersDb);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      const emptyDb = normalizeUsersDb({ users: [] });
      await writeUsersDb(emptyDb);
      return emptyDb;
    }

    throw error;
  }
}

export async function writeUsersDb(data: UsersDb): Promise<void> {
  await fs.writeFile(usersFilePath, `${JSON.stringify(normalizeUsersDb(data), null, 2)}\n`, "utf8");
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string): Promise<AppUser | undefined> {
  const db = await readUsersDb();
  const normalizedEmail = normalizeEmail(email);

  return db.users.find((user) => normalizeEmail(user.email) === normalizedEmail);
}

export async function getUserById(userId: string): Promise<AppUser | undefined> {
  const db = await readUsersDb();
  return db.users.find((user) => user.id === userId);
}

export async function createUser(email: string, password: string): Promise<AppUser> {
  const db = await readUsersDb();
  const sanitizedEmail = sanitizeEmail(email);
  const normalizedEmail = normalizeEmail(sanitizedEmail);

  if (db.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    throw new Error("E-postadressen används redan.");
  }

  const salt = randomBytes(16).toString("hex");
  const user: AppUser = {
    id: randomUUID(),
    email: sanitizedEmail,
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };

  await writeUsersDb({
    users: [...db.users, user],
  });

  return user;
}

export function verifyPassword(user: AppUser, password: string): boolean {
  const incomingHash = Buffer.from(hashPassword(password, user.passwordSalt), "hex");
  const storedHash = Buffer.from(user.passwordHash, "hex");

  if (incomingHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(incomingHash, storedHash);
}