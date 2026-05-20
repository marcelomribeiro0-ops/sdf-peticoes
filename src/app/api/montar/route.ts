import { NextRequest, NextResponse } from "next/server";
import { montarContestacao, secoesToHtml, type DadosExtraidos } from "@/lib/montagem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { teseIds, dados } = (await req.json()) as {
    teseIds?: string[];
    dados?: DadosExtraidos;
  };
  if (!Array.isArray(teseIds) || teseIds.length === 0) {
    return NextResponse.json(
      { error: "Selecione ao menos uma tese." },
      { status: 400 },
    );
  }
  const secoes = await montarContestacao(teseIds, dados || {});
  const html = secoesToHtml(secoes);
  return NextResponse.json({ html });
}
