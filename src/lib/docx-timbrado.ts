import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import PizZip from "pizzip";

/**
 * Gera um .docx usando o timbrado do escritório (assets/timbrado.docx)
 * como base. Substitui o corpo do documento mantendo cabeçalho, rodapé,
 * imagens e estilos.
 *
 * Formatação aplicada a todos os parágrafos do corpo:
 * - Fonte: Calibri Light 12,5pt
 * - Espaçamento entre linhas: 1,5
 * - Alinhamento: justificado
 * - Parágrafos argumentativos: numeração automática do Word (1, 2, 3...)
 *   com número na margem esquerda e texto recuado em ~1,5cm (hanging).
 * - Parágrafos não numerados: endereçamento, qualificação, citações,
 *   pedidos (alíneas a/b/c) e rodapé.
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

/**
 * Detecta se um parágrafo deve receber auto-numeração do Word.
 * Exclui: títulos, citações, endereçamento, qualificação, alíneas de
 * pedidos, rodapé e linhas de assinatura.
 */
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
    "Súmula:",
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
  // Alíneas dos pedidos (a) b) c)...)
  if (/^[a-z]\)/.test(t)) return false;
  // Linha "Cidade, dd de mês de aaaa." do rodapé já preenchida
  if (/^[A-ZÁ-Ú][\w\sá-úÁ-Ú]+,\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/.test(t))
    return false;
  if (t.includes("{{DATA}}")) return false;
  return true;
}

/** Remove pattern "N." ou "N.N" do início do primeiro run, se houver. */
function stripLeadingNumber(runs: Run[]): Run[] {
  if (runs.length === 0) return runs;
  const first = runs[0];
  const m = first.text.match(/^\s*\d+(?:\.\d+)?\.\s+/);
  if (!m) return runs;
  return [{ ...first, text: first.text.slice(m[0].length) }, ...runs.slice(1)];
}

function runProps(style: RunStyle): string {
  const props: string[] = [
    `<w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light" w:cs="Calibri Light"/>`,
    `<w:sz w:val="25"/>`,
    `<w:szCs w:val="25"/>`,
  ];
  if (style.bold) props.push(`<w:b/>`);
  if (style.italic) props.push(`<w:i/>`);
  if (style.underline) props.push(`<w:u w:val="single"/>`);
  return props.join("");
}

function runsToXml(runs: Run[]): string {
  return runs
    .map((r) => {
      const parts = r.text.split("\n");
      return parts
        .map((part, idx) => {
          let xml = "";
          if (part) {
            xml += `<w:r><w:rPr>${runProps(r.style)}</w:rPr><w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`;
          }
          if (idx < parts.length - 1) xml += `<w:r><w:br/></w:r>`;
          return xml;
        })
        .join("");
    })
    .join("");
}

type ParagraphOpts = {
  runs: Run[];
  titulo?: boolean;
  citacao?: boolean;
  numerado?: boolean;
};

function paragraphXml({
  runs,
  titulo = false,
  citacao = false,
  numerado = false,
}: ParagraphOpts): string {
  // Título: centralizado, negrito
  if (titulo) {
    const pPr = [
      `<w:jc w:val="center"/>`,
      `<w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/>`,
    ].join("");
    const defaultRunProps = `<w:rPr>${runProps({ bold: true })}</w:rPr>`;
    return `<w:p><w:pPr>${pPr}${defaultRunProps}</w:pPr>${runsToXml(
      runs.map((r) => ({ ...r, style: { ...r.style, bold: true } })),
    )}</w:p>`;
  }

  const props: string[] = [
    `<w:jc w:val="both"/>`,
    `<w:spacing w:before="0" w:after="120" w:line="360" w:lineRule="auto"/>`,
  ];

  if (numerado) {
    props.push(
      `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="999"/></w:numPr>`,
    );
    // O recuo vem da definição da numeração (hanging indent)
  } else if (citacao) {
    props.push(`<w:ind w:left="1134" w:firstLine="0"/>`);
  } else {
    props.push(`<w:ind w:firstLine="720"/>`);
  }

  const defaultRunProps = `<w:rPr>${runProps({})}</w:rPr>`;
  return `<w:p><w:pPr>${props.join("")}${defaultRunProps}</w:pPr>${runsToXml(runs)}</w:p>`;
}

function bodyXmlFromHtml(html: string): string {
  const blocks = parseHtml(html);
  const xmls: string[] = [];
  for (const b of blocks) {
    if (b.type === "p") {
      const numerado = shouldAutoNumber(b.runs, !!b.titulo, false);
      const runs = numerado ? stripLeadingNumber(b.runs) : b.runs;
      xmls.push(paragraphXml({ runs, titulo: b.titulo, numerado }));
    } else if (b.type === "quote") {
      xmls.push(paragraphXml({ runs: b.runs, citacao: true }));
    } else if (b.type === "list") {
      b.items.forEach((item) => {
        xmls.push(paragraphXml({ runs: item, numerado: true }));
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

function patchNumberingXml(originalXml: string): string {
  if (originalXml.includes('w:numId="999"')) return originalXml;
  const abstractNumXml =
    `<w:abstractNum w:abstractNumId="999">` +
    `<w:multiLevelType w:val="singleLevel"/>` +
    `<w:lvl w:ilvl="0">` +
    `<w:start w:val="1"/>` +
    `<w:numFmt w:val="decimal"/>` +
    `<w:lvlText w:val="%1."/>` +
    `<w:lvlJc w:val="left"/>` +
    `<w:pPr><w:ind w:left="850" w:hanging="850"/></w:pPr>` +
    `<w:rPr><w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light" w:cs="Calibri Light"/><w:sz w:val="25"/></w:rPr>` +
    `</w:lvl>` +
    `</w:abstractNum>`;
  const numXml = `<w:num w:numId="999"><w:abstractNumId w:val="999"/></w:num>`;
  return originalXml.replace(
    /<\/w:numbering>/,
    `${abstractNumXml}${numXml}</w:numbering>`,
  );
}

export async function gerarDocxComTimbrado(html: string): Promise<Buffer> {
  const base = await fs.readFile(TIMBRADO_PATH);
  const zip = new PizZip(base);

  const documentXml = zip.file("word/document.xml")?.asText();
  if (!documentXml) throw new Error("timbrado.docx sem word/document.xml");
  const novoBody = bodyXmlFromHtml(html);
  zip.file("word/document.xml", replaceDocumentBody(documentXml, novoBody));

  const numberingXml = zip.file("word/numbering.xml")?.asText();
  if (numberingXml) {
    zip.file("word/numbering.xml", patchNumberingXml(numberingXml));
  }

  return zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
}
