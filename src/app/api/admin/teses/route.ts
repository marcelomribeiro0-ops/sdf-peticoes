import { NextRequest, NextResponse } from "next/server";
import {
  listarTeses,
  salvarTese,
  slugify,
  type Tese,
  type CategoriaTese,
} from "@/lib/teses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const teses = await listarTeses();
  return NextResponse.json(teses);
}

const CATEGORIAS_VALIDAS: CategoriaTese[] = [
  "preliminar",
  "merito",
  "subsidiario",
];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Tese>;
  const erro = validar(body);
  if (erro) return NextResponse.json({ error: erro }, { status: 400 });

  const id = (body.id && body.id.trim()) || slugify(body.nome!);
  const tese: Tese = {
    id,
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

  const existentes = await listarTeses();
  if (existentes.some((t) => t.id === id)) {
    return NextResponse.json(
      { error: `Já existe uma tese com o id "${id}".` },
      { status: 409 },
    );
  }

  await salvarTese(tese);
  return NextResponse.json(tese, { status: 201 });
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
