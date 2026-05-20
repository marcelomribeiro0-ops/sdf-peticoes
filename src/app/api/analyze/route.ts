import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { analyzePeticao } from "@/lib/analyze";
import { extrairTexto } from "@/lib/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  let peticao = "";
  let nomeArquivo: string | null = null;
  let paginas: number | undefined;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Envie um arquivo no campo 'file'." },
          { status: 400 },
        );
      }
      nomeArquivo = file.name;
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = await extrairTexto(file.name, buf);
      peticao = ext.texto;
      paginas = ext.paginas;
    } else {
      const body = (await req.json()) as { peticao?: string };
      peticao = body.peticao || "";
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Falha ao ler o arquivo enviado.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!peticao || peticao.trim().length < 50) {
    return NextResponse.json(
      {
        error:
          "Não foi possível extrair texto suficiente do arquivo (mínimo 50 caracteres). O PDF pode ser uma imagem digitalizada sem OCR.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await analyzePeticao(peticao);
    return NextResponse.json({
      ...result,
      arquivo: nomeArquivo,
      paginas,
      caracteres: peticao.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
