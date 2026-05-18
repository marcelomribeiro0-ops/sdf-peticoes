"use client";

import { useMemo, useState } from "react";
import type { Sugestao } from "@/lib/analyze";
import type { Tese } from "@/lib/teses";

type Step = "input" | "sugestoes" | "editor";

export default function Page() {
  const [step, setStep] = useState<Step>("input");
  const [peticao, setPeticao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [modo, setModo] = useState<"ia" | "mock" | null>(null);
  const [teseAtual, setTeseAtual] = useState<Tese | null>(null);
  const [editorTexto, setEditorTexto] = useState("");

  const placeholders = useMemo(() => {
    const set = new Set<string>();
    const re = /\{\{([A-Z0-9_]+)\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(editorTexto)) !== null) set.add(m[1]);
    return Array.from(set);
  }, [editorTexto]);

  async function analisar() {
    setErro(null);
    setLoading(true);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ peticao }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Falha ao analisar");
      setSugestoes(data.sugestoes);
      setModo(data.modo);
      setStep("sugestoes");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function escolherTese(teseId: string) {
    setErro(null);
    setLoading(true);
    try {
      const r = await fetch(`/api/tese/${teseId}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Falha ao carregar tese");
      setTeseAtual(data);
      setEditorTexto(data.template);
      setStep("editor");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  function copiarTexto() {
    navigator.clipboard.writeText(editorTexto);
  }

  function baixarTxt() {
    const blob = new Blob([editorTexto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contestacao-${teseAtual?.id ?? "peticao"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function voltar() {
    if (step === "editor") setStep("sugestoes");
    else if (step === "sugestoes") setStep("input");
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              SDF Petições
            </h1>
            <p className="text-xs text-ink-500">
              Agente de IA — Módulo de Contestação
            </p>
          </div>
          <nav className="flex items-center gap-2 text-xs text-ink-500">
            <StepBadge active={step === "input"} label="1. Petição inicial" />
            <Sep />
            <StepBadge active={step === "sugestoes"} label="2. Teses sugeridas" />
            <Sep />
            <StepBadge active={step === "editor"} label="3. Editor" />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {erro && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {step === "input" && (
          <section className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold">
              Cole a petição inicial
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              A IA vai ler e sugerir as teses de contestação aplicáveis.
            </p>
            <textarea
              value={peticao}
              onChange={(e) => setPeticao(e.target.value)}
              placeholder="Cole aqui o texto integral da petição inicial..."
              className="mt-4 h-80 w-full resize-y rounded-lg border border-ink-200 bg-ink-50 p-4 text-sm leading-relaxed focus:border-ink-400 focus:bg-white focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink-500">
                {peticao.length.toLocaleString("pt-BR")} caracteres
              </span>
              <button
                onClick={analisar}
                disabled={loading || peticao.trim().length < 50}
                className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-ink-300"
              >
                {loading ? "Analisando..." : "Analisar com IA"}
              </button>
            </div>
          </section>
        )}

        {step === "sugestoes" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Teses sugeridas</h2>
                <p className="text-sm text-ink-500">
                  Clique em uma tese para abrir o modelo no editor.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {modo === "mock" && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    modo mock (sem ANTHROPIC_API_KEY)
                  </span>
                )}
                <button
                  onClick={voltar}
                  className="text-sm text-ink-600 hover:text-ink-900"
                >
                  ← voltar
                </button>
              </div>
            </div>

            <ul className="grid gap-3 md:grid-cols-2">
              {sugestoes.map((s) => (
                <li key={s.teseId}>
                  <button
                    onClick={() => escolherTese(s.teseId)}
                    disabled={loading}
                    className="group h-full w-full rounded-xl border border-ink-200 bg-white p-5 text-left shadow-sm transition hover:border-ink-400 hover:shadow disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-ink-900">{s.nome}</h3>
                      <ConfidenceBadge value={s.confianca} />
                    </div>
                    <p className="mt-2 text-sm text-ink-600">
                      {s.justificativa}
                    </p>
                    <span className="mt-3 inline-block text-xs font-medium text-ink-500 group-hover:text-ink-900">
                      abrir editor →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {step === "editor" && teseAtual && (
          <section className="grid gap-6 lg:grid-cols-[1fr,280px]">
            <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">{teseAtual.nome}</h2>
                  <p className="text-xs text-ink-500">{teseAtual.resumo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={voltar}
                    className="text-sm text-ink-600 hover:text-ink-900"
                  >
                    ← teses
                  </button>
                  <button
                    onClick={copiarTexto}
                    className="rounded-md border border-ink-300 px-3 py-1.5 text-sm hover:bg-ink-100"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={baixarTxt}
                    className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Baixar .txt
                  </button>
                </div>
              </div>
              <textarea
                value={editorTexto}
                onChange={(e) => setEditorTexto(e.target.value)}
                className="h-[70vh] w-full resize-y rounded-lg border border-ink-200 bg-ink-50 p-4 font-mono text-[13px] leading-relaxed focus:border-ink-400 focus:bg-white focus:outline-none"
              />
            </div>

            <aside className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">Placeholders</h3>
              <p className="mt-1 text-xs text-ink-500">
                Campos no texto entre <code>{"{{ }}"}</code> que você precisa preencher.
              </p>
              <ul className="mt-3 space-y-1.5">
                {placeholders.length === 0 && (
                  <li className="text-xs text-ink-400">
                    Nenhum placeholder restante 🎯
                  </li>
                )}
                {placeholders.map((p) => (
                  <li
                    key={p}
                    className="rounded-md bg-ink-100 px-2.5 py-1 font-mono text-xs text-ink-700"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

function StepBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-ink-900 px-2.5 py-1 text-xs font-medium text-white"
          : "text-xs text-ink-500"
      }
    >
      {label}
    </span>
  );
}

function Sep() {
  return <span className="text-ink-300">›</span>;
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 70
      ? "bg-emerald-100 text-emerald-800"
      : pct >= 40
        ? "bg-amber-100 text-amber-800"
        : "bg-ink-100 text-ink-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {pct}%
    </span>
  );
}
