import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

export type CategoriaTese = "preliminar" | "merito" | "subsidiario";

export type Tese = {
  id: string;
  nome: string;
  categoria: CategoriaTese;
  resumo: string;
  quandoAplicar: string;
  palavrasChave: string[];
  /** Texto da seção argumentativa (sem cabeçalho/qualificação/rodapé). */
  texto: string;
  /** Item específico a ser incluído na seção "DOS PEDIDOS". */
  pedido: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const TESES_FILE = path.join(DATA_DIR, "teses.json");

async function ensureSeeded(): Promise<void> {
  try {
    await fs.access(TESES_FILE);
  } catch {
    const { TESES_SEED } = await import("./teses-seed");
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      TESES_FILE,
      JSON.stringify(TESES_SEED, null, 2),
      "utf-8",
    );
  }
}

async function read(): Promise<Tese[]> {
  await ensureSeeded();
  const data = await fs.readFile(TESES_FILE, "utf-8");
  return JSON.parse(data) as Tese[];
}

async function write(teses: Tese[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TESES_FILE, JSON.stringify(teses, null, 2), "utf-8");
}

export async function listarTeses(): Promise<Tese[]> {
  return read();
}

export async function getTeseById(id: string): Promise<Tese | undefined> {
  const teses = await read();
  return teses.find((t) => t.id === id);
}

export async function getTesesPorIds(ids: string[]): Promise<Tese[]> {
  const teses = await read();
  const byId = new Map(teses.map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter((t): t is Tese => Boolean(t));
}

export async function salvarTese(tese: Tese): Promise<void> {
  const teses = await read();
  const idx = teses.findIndex((t) => t.id === tese.id);
  if (idx >= 0) teses[idx] = tese;
  else teses.push(tese);
  await write(teses);
}

export async function deletarTese(id: string): Promise<void> {
  const teses = await read();
  await write(teses.filter((t) => t.id !== id));
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
