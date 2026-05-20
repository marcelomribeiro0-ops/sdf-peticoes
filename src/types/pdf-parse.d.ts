declare module "pdf-parse/lib/pdf-parse.js" {
  import { Buffer } from "node:buffer";
  export type PdfParseResult = {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  };
  const pdfParse: (data: Buffer | Uint8Array) => Promise<PdfParseResult>;
  export default pdfParse;
}
