import { NextRequest } from "next/server";
import { gerarDocxComTimbrado } from "@/lib/docx-timbrado";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { html, filename } = (await req.json()) as {
    html?: string;
    filename?: string;
  };
  if (!html || typeof html !== "string") {
    return Response.json({ error: "Campo 'html' obrigatório." }, { status: 400 });
  }
  try {
    const buf = await gerarDocxComTimbrado(html);
    const safeName = (filename || "contestacao").replace(/[^\w\-.]/g, "_");
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeName}.docx"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro";
    return Response.json({ error: msg }, { status: 500 });
  }
}
