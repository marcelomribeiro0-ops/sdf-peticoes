import { NextResponse } from "next/server";
import { getTeseById } from "@/lib/teses";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const tese = await getTeseById(params.id);
  if (!tese) {
    return NextResponse.json({ error: "Tese não encontrada" }, { status: 404 });
  }
  return NextResponse.json(tese);
}
