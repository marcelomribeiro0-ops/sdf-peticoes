import { NextRequest, NextResponse } from "next/server";
import {
  getTeseById,
  salvarTese,
  deletarTese,
  type Tese,
  type CategoriaTese,
} from "@/lib/teses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIAS_VALIDAS: CategoriaTese[] = [
  "preliminar",
  "merito",
  "subsidiario",
];

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const tese = await getTeseById(params.id);
  if (!tese)
    return NextResponse.json({ error: "Tese não encontrada" }, { status: 404 });
  return NextResponse.json(tese);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const existente = await getTeseById(params.id);
  if (!existente)
    return NextResponse.json({ error: "Tese não encontrada" }, { status: 404 });
  const body = (await req.json()) as Partial<Tese>;
  const erro = validar(body);
  if (erro) return NextResponse.json({ error: erro }, { status: 400 });

  const atualizado: Tese = {
    id: existente.id,
    nome: body.nome!.trim(),
    categoria: body.categoria as CategoriaTese,
    resumo: body.resumo!.trim(),
    quandoAplicar: body.quandoAplicar!.trim(),
    palavrasChave: Array.isArray(body.palavrasChave)
      ? body.palavrasChave.map((s) => String(s).trim()).filter(Boolean)
      : [],
    texto: body.texto!,
    pedido: body.pedido!,
  };
  await salvarTese(atualizado);
  return NextResponse.json(atualizado);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const existente = await getTeseById(params.id);
  if (!existente)
    return NextResponse.json({ error: "Tese não encontrada" }, { status: 404 });
  await deletarTese(params.id);
  return NextResponse.json({ ok: true });
}

function validar(t: Partial<Tese>): string | null {
  if (!t.nome || !t.nome.trim()) return "Campo 'nome' obrigatório.";
  if (!t.categoria || !CATEGORIAS_VALIDAS.includes(t.categoria))
    return "Campo 'categoria' deve ser preliminar, merito ou subsidiario.";
  if (!t.resumo || !t.resumo.trim()) return "Campo 'resumo' obrigatório.";
  if (!t.quandoAplicar || !t.quandoAplicar.trim())
    return "Campo 'quandoAplicar' obrigatório.";
  if (!t.texto || !t.texto.trim()) return "Campo 'texto' obrigatório.";
  if (!t.pedido || !t.pedido.trim()) return "Campo 'pedido' obrigatório.";
  return null;
}
