"use client";

import { useMemo, useRef, useState } from "react";
import type { Sugestao } from "@/lib/analyze";
import type { Tese } from "@/lib/teses";

type Step = "input" | "sugestoes" | "editor";

const ACEITOS = ".pdf,.docx,.txt,.md";

export default function Page() {
  const [step, setStep] = useState<Step>("input");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [modo, setModo] = useState<"ia" | "mock" | null>(null);
  const [metaArquivo, setMetaArquivo] = useState<{
    nome: string | null;
    paginas?: number;
    caracteres?: number;
  } | null>(null);
  const [teseAtual, setTeseAtual] = useState<Tese | null>(null);
  const [editorTexto, setEditorTexto] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = useMemo(() => {
    const set = new Set<string>();
    const re = /\{\{([A-Z0-9_]+)\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(editorTexto)) !== null) set.add(m[1]);
    return Array.from(set);
  }, [editorTexto]);

  function selecionarArquivo(f: File | null | undefined) {
    setErro(null);
    if (!f) return;
    const lower = f.name.toLowerCase();
    const ok =
      lower.endsWith(".pdf") ||
      lower.endsWith(".docx") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".md");
    if (!ok) {
      setErro("Formato não suportado. Envie PDF, DOCX ou TXT.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setErro("Arquivo muito grande. Limite de 50 MB.");
      return;
    }
    setArquivo(f);
  }

  async function analisar() {
    if (!arquivo) return;
    setErro(null);
    setLoading(true);
    setStatusMsg("Extraindo texto e analisando com a IA...");
    try {
      const fd = new FormData();
      fd.append("file", arquivo);
      const r = await fetch("/api/analyze", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Falha ao analisar");
      setSugestoes(data.sugestoes);
      setModo(data.modo);
      setMetaArquivo({
        nome: data.arquivo,
        paginas: data.paginas,
        caracteres: data.caracteres,
      });
      setStep("sugestoes");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
      setStatusMsg(null);
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

  function resetar() {
    setArquivo(null);
    setSugestoes([]);
    setMetaArquivo(null);
    setTeseAtual(null);
    setEditorTexto("");
    setErro(null);
    setStep("input");
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
            <StepBadge active={step === "input"} label="1. Enviar arquivo" />
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
              Envie a petição inicial ou o arquivo único do processo
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              A IA vai ler o documento e sugerir as teses de contestação aplicáveis.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                selecionarArquivo(e.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition ${
                dragging
                  ? "border-ink-700 bg-ink-100"
                  : "border-ink-300 bg-ink-50 hover:border-ink-400 hover:bg-ink-100"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACEITOS}
                className="hidden"
                onChange={(e) => selecionarArquivo(e.target.files?.[0])}
              />
              <UploadIcon />
              <p className="mt-3 text-sm font-medium text-ink-800">
                Arraste o arquivo aqui ou clique para selecionar
              </p>
              <p className="mt-1 text-xs text-ink-500">
                PDF, DOCX ou TXT — até 50 MB
              </p>

              {arquivo && (
                <div className="mt-4 flex items-center gap-3 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm">
                  <FileIcon />
                  <div className="text-left">
                    <p className="font-medium text-ink-900">{arquivo.name}</p>
                    <p className="text-xs text-ink-500">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setArquivo(null);
                    }}
                    className="ml-2 text-xs text-ink-500 hover:text-red-600"
                    aria-label="Remover arquivo"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink-500">
                {statusMsg ?? "Aceita PDFs com texto. PDFs digitalizados (imagem) precisam de OCR."}
              </span>
              <button
                onClick={analisar}
                disabled={loading || !arquivo}
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
                  {metaArquivo?.nome && (
                    <>
                      Baseado em <span className="font-medium">{metaArquivo.nome}</span>
                      {metaArquivo.paginas
                        ? ` · ${metaArquivo.paginas} pág.`
                        : ""}
                      {metaArquivo.caracteres
                        ? ` · ${metaArquivo.caracteres.toLocaleString("pt-BR")} caracteres`
                        : ""}
                      . Clique em uma tese para abrir o modelo.
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {modo === "mock" && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    modo mock (sem ANTHROPIC_API_KEY)
                  </span>
                )}
                <button
                  onClick={resetar}
                  className="text-sm text-ink-600 hover:text-ink-900"
                >
                  ← novo arquivo
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

function UploadIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ink-400"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ink-500"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
