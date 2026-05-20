"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TeseAdmin = {
  id: string;
  nome: string;
  categoria: "preliminar" | "merito" | "subsidiario";
  resumo: string;
  quandoAplicar: string;
  palavrasChave: string[];
};

const LABEL_CATEGORIA: Record<TeseAdmin["categoria"], string> = {
  preliminar: "Preliminar",
  merito: "Mérito",
  subsidiario: "Subsidiário",
};

export default function AdminHome() {
  const [teses, setTeses] = useState<TeseAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const r = await fetch("/api/admin/teses");
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Falha ao carregar");
      setTeses(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function deletar(id: string, nome: string) {
    if (!confirm(`Excluir a tese "${nome}"? Esta ação não pode ser desfeita.`))
      return;
    const r = await fetch(`/api/admin/teses/${id}`, { method: "DELETE" });
    if (r.ok) carregar();
    else {
      const data = await r.json();
      setErro(data.error || "Falha ao deletar");
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              SDF Petições · Admin
            </h1>
            <p className="text-xs text-ink-500">Gerenciar banco de teses</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
            >
              ← App
            </Link>
            <Link
              href="/admin/nova"
              className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700"
            >
              + Nova tese
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {erro && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {loading && (
          <p className="text-sm text-ink-500">Carregando...</p>
        )}

        {!loading && teses.length === 0 && (
          <p className="text-sm text-ink-500">
            Nenhuma tese cadastrada. <Link href="/admin/nova" className="font-medium underline">Crie a primeira</Link>.
          </p>
        )}

        <ul className="space-y-2">
          {teses.map((t) => (
            <li
              key={t.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-ink-200 bg-white p-4 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink-900">{t.nome}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      t.categoria === "preliminar"
                        ? "bg-violet-100 text-violet-800"
                        : t.categoria === "merito"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {LABEL_CATEGORIA[t.categoria]}
                  </span>
                  <span className="font-mono text-[10px] text-ink-400">{t.id}</span>
                </div>
                <p className="mt-1 text-sm text-ink-600">{t.resumo}</p>
                <p className="mt-1 text-xs text-ink-500">
                  <span className="font-medium">Quando aplicar:</span> {t.quandoAplicar}
                </p>
                {t.palavrasChave.length > 0 && (
                  <p className="mt-1 text-[11px] text-ink-400">
                    Palavras-chave: {t.palavrasChave.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/${t.id}`}
                  className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
                >
                  Editar
                </Link>
                <button
                  onClick={() => deletar(t.id, t.nome)}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
