import { NextRequest, NextResponse } from "next/server";
import data from "@/server/db.json";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(data);
}
