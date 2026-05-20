import { NextResponse } from "next/server";
import { listarTeses } from "@/lib/teses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const teses = await listarTeses();
  // Lista enxuta — sem o "texto" completo, pra trafegar menos.
  return NextResponse.json(
    teses.map((t) => ({
      id: t.id,
      nome: t.nome,
      categoria: t.categoria,
      resumo: t.resumo,
      quandoAplicar: t.quandoAplicar,
    })),
  );
}
