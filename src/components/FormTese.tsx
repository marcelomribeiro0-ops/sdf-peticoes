"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tese = {
  id?: string;
  nome: string;
  categoria: "preliminar" | "merito" | "subsidiario";
  resumo: string;
  quandoAplicar: string;
  palavrasChave: string[];
  texto: string;
  pedido: string;
};

type Props = {
  inicial?: Partial<Tese>;
  modo: "nova" | "editar";
};

const VAZIA: Tese = {
  nome: "",
  categoria: "merito",
  resumo: "",
  quandoAplicar: "",
  palavrasChave: [],
  texto: "",
  pedido: "",
};

export function FormTese({ inicial, modo }: Props) {
  const router = useRouter();
  const [t, setT] = useState<Tese>({ ...VAZIA, ...inicial });
  const [palavrasInput, setPalavrasInput] = useState(
    (inicial?.palavrasChave ?? []).join(", "),
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    setLoading(true);
    try {
      const palavrasChave = palavrasInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const body = { ...t, palavrasChave };

      const url =
        modo === "nova" ? "/api/admin/teses" : `/api/admin/teses/${t.id}`;
      const method = modo === "nova" ? "POST" : "PUT";
      const r = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || "Falha ao salvar");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  const Label = ({
    children,
    desc,
  }: {
    children: React.ReactNode;
    desc?: string;
  }) => (
    <div>
      <label className="text-sm font-medium text-ink-800">{children}</label>
      {desc && <p className="text-xs text-ink-500">{desc}</p>}
    </div>
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {modo === "nova" ? "Nova tese" : "Editar tese"}
            </h1>
            <p className="text-xs text-ink-500">
              {modo === "editar" && t.id ? (
                <span className="font-mono">{t.id}</span>
              ) : (
                "Adiciona uma nova tese ao banco do escritório"
              )}
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {erro && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="space-y-5 rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
          <div>
            <Label desc="Nome curto que aparece na lista de sugestões. Ex: Prescrição Ânua (art. 206 CC)">
              Nome da tese
            </Label>
            <input
              value={t.nome}
              onChange={(e) => setT({ ...t, nome: e.target.value })}
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
            />
          </div>

          <div>
            <Label desc="Preliminar entra na seção III, mérito/subsidiário na seção IV do documento montado.">
              Categoria
            </Label>
            <select
              value={t.categoria}
              onChange={(e) =>
                setT({ ...t, categoria: e.target.value as Tese["categoria"] })
              }
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
            >
              <option value="preliminar">Preliminar / Prejudicial</option>
              <option value="merito">Mérito</option>
              <option value="subsidiario">Subsidiário (eventualidade)</option>
            </select>
          </div>

          <div>
            <Label desc="1-2 frases descrevendo a tese. Aparece como subtítulo no card de sugestão.">
              Resumo
            </Label>
            <input
              value={t.resumo}
              onChange={(e) => setT({ ...t, resumo: e.target.value })}
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
            />
          </div>

          <div>
            <Label desc="Em que condição esta tese se aplica. A IA usa isso para decidir se sugere ou não.">
              Quando aplicar
            </Label>
            <textarea
              value={t.quandoAplicar}
              onChange={(e) => setT({ ...t, quandoAplicar: e.target.value })}
              className="mt-1 h-20 w-full resize-y rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
            />
          </div>

          <div>
            <Label desc="Lista separada por vírgula. Usadas no fallback mock (sem IA) e como reforço para o modelo.">
              Palavras-chave
            </Label>
            <input
              value={palavrasInput}
              onChange={(e) => setPalavrasInput(e.target.value)}
              placeholder="prescrição, ânua, prazo, art. 206"
              className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
            />
          </div>

          <div>
            <Label desc="Texto da seção argumentativa (sem cabeçalho/qualificação/rodapé). Use {{PLACEHOLDERS}} entre chaves duplas para campos variáveis. A primeira linha vira o título da seção.">
              Texto da tese
            </Label>
            <textarea
              value={t.texto}
              onChange={(e) => setT({ ...t, texto: e.target.value })}
              className="mt-1 h-80 w-full resize-y rounded-md border border-ink-200 bg-white px-3 py-2 font-mono text-[13px] leading-relaxed focus:border-ink-400 focus:outline-none"
            />
          </div>

          <div>
            <Label desc="Item específico que vai entrar na seção 'DOS PEDIDOS'. Ex: 'Seja a ação extinta com resolução de mérito em razão da prescrição (art. 487, II, CPC);'">
              Pedido
            </Label>
            <textarea
              value={t.pedido}
              onChange={(e) => setT({ ...t, pedido: e.target.value })}
              className="mt-1 h-24 w-full resize-y rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Link
              href="/admin"
              className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              Cancelar
            </Link>
            <button
              onClick={salvar}
              disabled={loading}
              className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-ink-300"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
