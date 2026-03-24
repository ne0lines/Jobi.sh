import "dotenv/config";
import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    name: "", // name
    email: "", // email
    profession: "Developer", // role
    complete: false,
  },
];

async function main() {
  try {
    for (const u of userData) {
      await prisma.user.create({ data: u });
    }
  } catch (error) {
    console.error(error);
  }
}

main();
