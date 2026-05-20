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
 * - Parágrafos numerados automaticamente quando começam com "N." ou "N.N"
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
      // Detecta título: parágrafo todo em negrito ou começando com numeração romana
      const allBold = runs.length > 0 && runs.every((r) => r.style.bold);
      const textoCompleto = runs.map((r) => r.text).join("");
      const ehTituloRoman =
        /^[IVXLCDM]+\s*[–\-]\s/.test(textoCompleto.trim()) && allBold;
      blocks.push({ type: "p", runs, titulo: allBold || ehTituloRoman });
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

function runsToXml(runs: Run[]): string {
  return runs
    .map((r) => {
      const text = r.text;
      // Quebras de linha viram <w:br/>
      const parts = text.split("\n");
      return parts
        .map((part, idx) => {
          let xml = "";
          if (part) {
            const props: string[] = [
              `<w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light" w:cs="Calibri Light"/>`,
              `<w:sz w:val="25"/>`,
              `<w:szCs w:val="25"/>`,
            ];
            if (r.style.bold) props.push(`<w:b/>`);
            if (r.style.italic) props.push(`<w:i/>`);
            if (r.style.underline) props.push(`<w:u w:val="single"/>`);
            xml += `<w:r><w:rPr>${props.join("")}</w:rPr><w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`;
          }
          if (idx < parts.length - 1) {
            xml += `<w:r><w:br/></w:r>`;
          }
          return xml;
        })
        .join("");
    })
    .join("");
}

function paragraphXml({
  runs,
  titulo = false,
  indentLeft,
  numbering,
}: {
  runs: Run[];
  titulo?: boolean;
  indentLeft?: number;
  numbering?: { ref: string; level: number };
}): string {
  const props: string[] = [
    `<w:jc w:val="both"/>`,
    `<w:spacing w:before="0" w:after="120" w:line="360" w:lineRule="auto"/>`,
  ];
  if (indentLeft) {
    props.push(`<w:ind w:left="${indentLeft}" w:firstLine="0"/>`);
  } else {
    props.push(`<w:ind w:firstLine="720"/>`);
  }
  if (numbering) {
    props.push(
      `<w:numPr><w:ilvl w:val="${numbering.level}"/><w:numId w:val="999"/></w:numPr>`,
    );
  }
  // Para títulos, centraliza e remove indentação
  if (titulo) {
    const p: string[] = [
      `<w:jc w:val="center"/>`,
      `<w:spacing w:before="240" w:after="120" w:line="360" w:lineRule="auto"/>`,
    ];
    const defaultRunProps = `<w:rPr><w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light" w:cs="Calibri Light"/><w:sz w:val="25"/><w:szCs w:val="25"/><w:b/></w:rPr>`;
    return `<w:p><w:pPr>${p.join("")}${defaultRunProps}</w:pPr>${runsToXml(runs.map((r) => ({ ...r, style: { ...r.style, bold: true } })))}</w:p>`;
  }
  const defaultRunProps = `<w:rPr><w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light" w:cs="Calibri Light"/><w:sz w:val="25"/><w:szCs w:val="25"/></w:rPr>`;
  return `<w:p><w:pPr>${props.join("")}${defaultRunProps}</w:pPr>${runsToXml(runs)}</w:p>`;
}

function bodyXmlFromHtml(html: string): string {
  const blocks = parseHtml(html);
  const xmls: string[] = [];
  for (const b of blocks) {
    if (b.type === "p") {
      xmls.push(paragraphXml({ runs: b.runs, titulo: b.titulo }));
    } else if (b.type === "quote") {
      xmls.push(paragraphXml({ runs: b.runs, indentLeft: 1134 }));
    } else if (b.type === "list") {
      b.items.forEach((item) => {
        xmls.push(
          paragraphXml({ runs: item, numbering: { ref: "default", level: 0 } }),
        );
      });
    }
  }
  return xmls.join("");
}

/**
 * Substitui o body do document.xml mantendo o <w:sectPr> existente
 * (que referencia o header/footer do timbrado).
 */
function replaceDocumentBody(originalXml: string, novoBodyXml: string): string {
  // Captura o sectPr existente (referências de header/footer)
  const sectPrMatch = originalXml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/);
  const sectPr = sectPrMatch ? sectPrMatch[0] : "";

  // Substitui o conteúdo entre <w:body> e </w:body>
  return originalXml.replace(
    /<w:body>[\s\S]*?<\/w:body>/,
    `<w:body>${novoBodyXml}${sectPr}</w:body>`,
  );
}

/**
 * Garante que numbering.xml tem uma definição numérica simples para nossas
 * listas ordenadas (numId=999).
 */
function patchNumberingXml(originalXml: string): string {
  if (originalXml.includes('w:numId="999"')) return originalXml;
  const abstractNumXml = `<w:abstractNum w:abstractNumId="999"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>`;
  const numXml = `<w:num w:numId="999"><w:abstractNumId w:val="999"/></w:num>`;
  // Insere antes do </w:numbering>
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
