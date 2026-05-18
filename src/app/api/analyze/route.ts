import { NextRequest, NextResponse } from "next/server";
import { analyzePeticao } from "@/lib/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { peticao } = (await req.json()) as { peticao?: string };
  if (!peticao || peticao.trim().length < 50) {
    return NextResponse.json(
      { error: "Cole o texto da petição inicial (mínimo 50 caracteres)." },
      { status: 400 },
    );
  }

  try {
    const result = await analyzePeticao(peticao);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
