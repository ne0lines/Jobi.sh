import { NextRequest, NextResponse } from "next/server";
import data from "@/server/db.json";
import { Db } from "@/app/types";

export async function GET(req: NextRequest): Promise<NextResponse<Db>> {
  const res = data as Db;

  return NextResponse.json(res);
}
