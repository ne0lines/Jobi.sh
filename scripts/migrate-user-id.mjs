import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const [, , oldUserId, newUserId] = process.argv;

if (!oldUserId || !newUserId) {
  console.error("Usage: node scripts/migrate-user-id.mjs <oldUserId> <newUserId>");
  process.exit(1);
}

const dbPath = resolve(process.cwd(), "src/server/db.json");
const db = JSON.parse(readFileSync(dbPath, "utf-8"));

let count = 0;
db.applications = db.applications.map((app) => {
  if (app.userId === oldUserId) {
    count++;
    return { ...app, userId: newUserId };
  }
  return app;
});

writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf-8");
console.log(`Updated ${count} application(s) from userId ${oldUserId} → ${newUserId}`);
