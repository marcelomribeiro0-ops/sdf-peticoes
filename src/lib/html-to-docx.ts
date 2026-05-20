import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

type RunStyle = { bold?: boolean; italic?: boolean; underline?: boolean };

type ParseNode =
  | { type: "p"; runs: Array<{ text: string; style: RunStyle }>; heading?: 1 | 2 | 3 }
  | { type: "list"; ordered: boolean; items: Array<Array<{ text: string; style: RunStyle }>> }
  | { type: "quote"; runs: Array<{ text: string; style: RunStyle }> };

/**
 * Parser HTML minimalista para o subconjunto produzido pelo TipTap
 * (StarterKit + Underline). Não usa libs de DOM no servidor.
 */
function parseHtml(html: string): ParseNode[] {
  const nodes: ParseNode[] = [];
  const blockRe =
    /<(p|h1|h2|h3|ul|ol|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (tag === "p") {
      nodes.push({ type: "p", runs: parseInline(inner) });
    } else if (tag === "h1" || tag === "h2" || tag === "h3") {
      nodes.push({
        type: "p",
        runs: parseInline(inner),
        heading: Number(tag[1]) as 1 | 2 | 3,
      });
    } else if (tag === "blockquote") {
      // blockquote pode conter <p>; achatamos
      const inside = parseHtml(inner);
      for (const n of inside) {
        if (n.type === "p")
          nodes.push({ type: "quote", runs: n.runs });
      }
    } else if (tag === "ul" || tag === "ol") {
      const items: Array<Array<{ text: string; style: RunStyle }>> = [];
      const liRe = /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = liRe.exec(inner)) !== null) {
        // <li> normalmente contém <p>...</p>
        const liInner = li[1];
        const pMatch = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i.exec(liInner);
        items.push(parseInline(pMatch ? pMatch[1] : liInner));
      }
      nodes.push({ type: "list", ordered: tag === "ol", items });
    }
  }
  return nodes;
}

function parseInline(html: string): Array<{ text: string; style: RunStyle }> {
  // Substitui <br> por quebra explícita usando um caractere reservado.
  const tokens = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/g, " ");

  const runs: Array<{ text: string; style: RunStyle }> = [];
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

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function runsToTextRuns(
  runs: Array<{ text: string; style: RunStyle }>,
): TextRun[] {
  const out: TextRun[] = [];
  for (const r of runs) {
    const parts = r.text.split("");
    parts.forEach((part, i) => {
      if (part) {
        out.push(
          new TextRun({
            text: part,
            bold: r.style.bold,
            italics: r.style.italic,
            underline: r.style.underline ? {} : undefined,
          }),
        );
      }
      if (i < parts.length - 1) {
        out.push(new TextRun({ text: "", break: 1 }));
      }
    });
  }
  return out;
}

export async function htmlToDocxBuffer(html: string): Promise<Buffer> {
  const nodes = parseHtml(html);
  const paragraphs: Paragraph[] = [];

  for (const n of nodes) {
    if (n.type === "p") {
      const heading =
        n.heading === 1
          ? HeadingLevel.HEADING_1
          : n.heading === 2
            ? HeadingLevel.HEADING_2
            : n.heading === 3
              ? HeadingLevel.HEADING_3
              : undefined;
      paragraphs.push(
        new Paragraph({
          children: runsToTextRuns(n.runs),
          heading,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200 },
        }),
      );
    } else if (n.type === "quote") {
      paragraphs.push(
        new Paragraph({
          children: runsToTextRuns(n.runs),
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 720 },
          spacing: { after: 200 },
        }),
      );
    } else if (n.type === "list") {
      n.items.forEach((item) => {
        paragraphs.push(
          new Paragraph({
            children: runsToTextRuns(item),
            bullet: n.ordered ? undefined : { level: 0 },
            numbering: n.ordered
              ? { reference: "default-numbering", level: 0 }
              : undefined,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
          }),
        );
      });
    }
  }

  const doc = new Document({
    creator: "SDF Petições",
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 }, // 12pt
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1701, right: 1134, bottom: 1701, left: 1701 }, // ~3/2/3/3 cm
          },
        },
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
