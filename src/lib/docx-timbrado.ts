import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";

/**
 * Gera um .docx replicando à risca o estilo do modelo do escritório
 * (assets/timbrado.docx). Substitui o corpo mantendo cabeçalho, rodapé,
 * imagens e estilos do timbrado.
 *
 * Estilo replicado do modelo de referência:
 * - Body / endereçamento / qualificação: Calibri Light 12,5pt
 *   (w:sz=25), espaçamento 1,5 (w:line=360), justificado, SEM indent.
 * - Títulos de seção: centralizados, negrito, mesma fonte/tamanho.
 *   Cercados por parágrafo vazio antes e depois.
 * - Numeração manual: prefixo "N." + <w:tab/> + texto. Sem auto-num.
 * - Citações (<blockquote>): w:ind left=1134, fonte 11pt (sz=22),
 *   justificado.
 * - Alíneas (a/b/c) dos pedidos: w:ind left=720 hanging=360.
 */

const TIMBRADO_PATH = path.join(process.cwd(), "assets", "timbrado.docx");

type RunStyle = { bold?: boolean; italic?: boolean; underline?: boolean };
type Run = { text: string; style: RunStyle };
type Block =
  | { type: "p"; runs: Run[]; titulo?: boolean }
  | { type: "quote"; runs: Run[] }
  | { type: "list"; ordered: boolean; items: Run[][] };

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseInline(html: string): Run[] {
  const tokens = html.replace(/<br\s*\/?>(?!\s*$)/gi, "\n");
  const runs: Run[] = [];
  const stack: RunStyle = {};
  const tagRe = /<(\/)?(strong|b|em|i|u)(?:\s[^>]*)?>|([^<]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(tokens)) !== null) {
    if (m[3] !== undefined) {
      const text = decodeEntities(m[3]);
      if (text) runs.push({ text, style: { ...stack } });
    } else {
      const closing = m[1] === "/";
      const tag = m[2].toLowerCase();
      const key: keyof RunStyle =
        tag === "strong" || tag === "b"
          ? "bold"
          : tag === "em" || tag === "i"
            ? "italic"
            : "underline";
      if (closing) delete stack[key];
      else stack[key] = true;
    }
  }
  return runs;
}

function parseHtml(html: string): Block[] {
  const blocks: Block[] = [];
  const blockRe =
    /<(p|h1|h2|h3|ul|ol|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (tag === "p") {
      const runs = parseInline(inner);
      const allBold = runs.length > 0 && runs.every((r) => r.style.bold);
      blocks.push({ type: "p", runs, titulo: allBold });
    } else if (tag === "h1" || tag === "h2" || tag === "h3") {
      blocks.push({ type: "p", runs: parseInline(inner), titulo: true });
    } else if (tag === "blockquote") {
      const inside = parseHtml(inner);
      for (const n of inside) {
        if (n.type === "p") blocks.push({ type: "quote", runs: n.runs });
      }
    } else if (tag === "ul" || tag === "ol") {
      const items: Run[][] = [];
      const liRe = /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = liRe.exec(inner)) !== null) {
        const pMatch = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i.exec(li[1]);
        items.push(parseInline(pMatch ? pMatch[1] : li[1]));
      }
      blocks.push({ type: "list", ordered: tag === "ol", items });
    }
  }
  return blocks;
}

function shouldAutoNumber(
  runs: Run[],
  isTitle: boolean,
  isQuote: boolean,
): boolean {
  if (isTitle || isQuote) return false;
  const t = runs
    .map((r) => r.text)
    .join("")
    .trim();
  if (!t) return false;
  const exemptStarts = [
    "Excelentíssim",
    "POTTENCIAL",
    "Súmula",
    "Espécie:",
    "Processo nº",
    "Processo:",
    "Nestes Termos",
    "Pede-se",
    "Felipe Bueno",
    "Marcelo Moreira",
    "Izabela Cristina",
    "Clara Villar",
    "{{CIDADE}}",
  ];
  for (const s of exemptStarts) {
    if (t.startsWith(s)) return false;
  }
  if (t.includes("OAB/MG")) return false;
  if (/^[a-z]\)/.test(t)) return false;
  if (/^[A-ZÁ-Ú][\w\sá-úÁ-Ú]+,\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/.test(t))
    return false;
  if (t.includes("{{DATA}}")) return false;
  return true;
}

function isAlinea(runs: Run[]): boolean {
  const t = runs
    .map((r) => r.text)
    .join("")
    .trim();
  return /^[a-z]\)/.test(t);
}

function stripLeadingNumber(runs: Run[]): Run[] {
  if (runs.length === 0) return runs;
  const first = runs[0];
  const m = first.text.match(/^\s*\d+(?:\.\d+)?\.\s+/);
  if (!m) return runs;
  return [{ ...first, text: first.text.slice(m[0].length) }, ...runs.slice(1)];
}

/** Run properties — fonte Calibri Light, tamanho configurável (default 25 = 12.5pt). */
function runProps(style: RunStyle, sz: number = 25): string {
  const props: string[] = [
    `<w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light" w:cs="Calibri Light"/>`,
    `<w:sz w:val="${sz}"/>`,
    `<w:szCs w:val="${sz}"/>`,
  ];
  if (style.bold) props.push(`<w:b/><w:bCs/>`);
  if (style.italic) props.push(`<w:i/><w:iCs/>`);
  if (style.underline) props.push(`<w:u w:val="single"/>`);
  return props.join("");
}

function runsToXml(runs: Run[], sz: number = 25): string {
  return runs
    .map((r) => {
      const parts = r.text.split("\n");
      return parts
        .map((part, idx) => {
          let xml = "";
          if (part) {
            xml += `<w:r><w:rPr>${runProps(r.style, sz)}</w:rPr><w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`;
          }
          if (idx < parts.length - 1) xml += `<w:r><w:br/></w:r>`;
          return xml;
        })
        .join("");
    })
    .join("");
}

/** Parágrafo vazio com a formatação padrão do body (usado como espaçador). */
function emptyParagraphXml(): string {
  return `<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr>${runProps({})}</w:rPr></w:pPr></w:p>`;
}

function tituloXml(runs: Run[]): string {
  const pPr = `<w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr>${runProps({ bold: true })}</w:rPr>`;
  const runsBold = runs.map((r) => ({ ...r, style: { ...r.style, bold: true } }));
  return `<w:p><w:pPr>${pPr}</w:pPr>${runsToXml(runsBold)}</w:p>`;
}

function bodyParagraphXml(
  runs: Run[],
  opts: { numero?: number; alinea?: boolean } = {},
): string {
  const props: string[] = [];
  if (opts.alinea) {
    props.push(`<w:ind w:left="720" w:hanging="360"/>`);
  }
  props.push(`<w:spacing w:line="360" w:lineRule="auto"/>`);
  props.push(`<w:jc w:val="both"/>`);
  const rPr = `<w:rPr>${runProps({})}</w:rPr>`;

  // Prefixo com "N." + <w:tab/> quando numerado
  let prefixoXml = "";
  if (opts.numero !== undefined) {
    prefixoXml =
      `<w:r><w:rPr>${runProps({})}</w:rPr><w:t>${opts.numero}.</w:t></w:r>` +
      `<w:r><w:rPr>${runProps({})}</w:rPr><w:tab/></w:r>`;
  }

  return `<w:p><w:pPr>${props.join("")}${rPr}</w:pPr>${prefixoXml}${runsToXml(runs)}</w:p>`;
}

function quoteParagraphXml(runs: Run[]): string {
  // Citação: indent left 1134, fonte 11pt (sz=22), justificado
  const pPr = `<w:ind w:left="1134"/><w:spacing w:line="360" w:lineRule="auto"/><w:jc w:val="both"/><w:rPr>${runProps({}, 22)}</w:rPr>`;
  return `<w:p><w:pPr>${pPr}</w:pPr>${runsToXml(runs, 22)}</w:p>`;
}

function bodyXmlFromHtml(html: string): string {
  const blocks = parseHtml(html);
  const xmls: string[] = [];
  let contador = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "p" && b.titulo) {
      // Empty antes (se não for o primeiríssimo bloco)
      if (xmls.length > 0) xmls.push(emptyParagraphXml());
      xmls.push(tituloXml(b.runs));
      xmls.push(emptyParagraphXml());
    } else if (b.type === "p") {
      const numerar = shouldAutoNumber(b.runs, false, false);
      const alinea = !numerar && isAlinea(b.runs);
      const runs = numerar ? stripLeadingNumber(b.runs) : b.runs;
      if (numerar) {
        contador += 1;
        xmls.push(bodyParagraphXml(runs, { numero: contador }));
      } else if (alinea) {
        xmls.push(bodyParagraphXml(runs, { alinea: true }));
      } else {
        xmls.push(bodyParagraphXml(runs));
      }
    } else if (b.type === "quote") {
      xmls.push(quoteParagraphXml(b.runs));
    } else if (b.type === "list") {
      b.items.forEach((item) => {
        contador += 1;
        xmls.push(bodyParagraphXml(item, { numero: contador }));
      });
    }
  }
  return xmls.join("");
}

function replaceDocumentBody(originalXml: string, novoBodyXml: string): string {
  const sectPrMatch = originalXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  const sectPr = sectPrMatch ? sectPrMatch[0] : "";
  return originalXml.replace(
    /<w:body>[\s\S]*?<\/w:body>/,
    `<w:body>${novoBodyXml}${sectPr}</w:body>`,
  );
}

export async function gerarDocxComTimbrado(html: string): Promise<Buffer> {
  const base = await fs.readFile(TIMBRADO_PATH);
  const zip = new PizZip(base);

  const documentXml = zip.file("word/document.xml")?.asText();
  if (!documentXml) throw new Error("timbrado.docx sem word/document.xml");
  const novoBody = bodyXmlFromHtml(html);
  zip.file("word/document.xml", replaceDocumentBody(documentXml, novoBody));

  return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
}
