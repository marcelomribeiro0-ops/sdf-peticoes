import { Buffer } from "node:buffer";

export type ExtractResult = {
  texto: string;
  paginas?: number;
  formato: "pdf" | "docx" | "txt";
};

export async function extrairTexto(
  nomeArquivo: string,
  buf: Buffer,
): Promise<ExtractResult> {
  const lower = nomeArquivo.toLowerCase();

  if (lower.endsWith(".pdf")) {
    // Importa o módulo interno para evitar o bug do pdf-parse que tenta
    // ler um arquivo de teste no índice do pacote.
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
      data: Buffer,
    ) => Promise<{ text: string; numpages: number }>;
    const data = await pdfParse(buf);
    return { texto: data.text, paginas: data.numpages, formato: "pdf" };
  }

  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: buf });
    return { texto: result.value, formato: "docx" };
  }

  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return { texto: buf.toString("utf-8"), formato: "txt" };
  }

  throw new Error(
    `Formato não suportado: ${nomeArquivo}. Use PDF, DOCX ou TXT.`,
  );
}
