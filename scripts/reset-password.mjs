import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error("Usage: npm run auth:reset-password -- <email> <new-password>");
  process.exit(1);
}

if (passwordArg.length < 8 || !/[A-Z]/.test(passwordArg) || !/[a-z]/.test(passwordArg) || !/\d/.test(passwordArg)) {
  console.error("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
  process.exit(1);
}

const usersFilePath = path.join(process.cwd(), "src/server/users.json");
const normalizedEmail = emailArg.trim().toLowerCase();
const raw = await readFile(usersFilePath, "utf8");
const data = JSON.parse(raw);
const user = data.users.find((entry) => String(entry.email || "").trim().toLowerCase() === normalizedEmail);

if (!user) {
  console.error(`No user found for ${normalizedEmail}.`);
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const passwordHash = scryptSync(passwordArg, salt, 64).toString("hex");

user.passwordSalt = salt;
user.passwordHash = passwordHash;

await writeFile(usersFilePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Password reset for ${normalizedEmail}.`);