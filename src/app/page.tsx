"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Sugestao, PerguntaConfirmacao } from "@/lib/analyze";
import type { DadosExtraidos } from "@/lib/montagem";
import { RichEditor } from "@/components/RichEditor";

type Step = "input" | "confirmacao" | "sugestoes" | "editor";

type RespostaPergunta = "sim" | "nao" | null;

type TeseLite = {
  id: string;
  nome: string;
  categoria: "preliminar" | "merito" | "subsidiario";
  resumo: string;
  quandoAplicar: string;
};

const ACEITOS = ".pdf,.docx,.txt,.md";

const LABEL_CATEGORIA: Record<TeseLite["categoria"], string> = {
  preliminar: "Preliminar",
  merito: "Mérito",
  subsidiario: "Subsidiário",
};

export default function Page() {
  const [step, setStep] = useState<Step>("input");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [todasTeses, setTodasTeses] = useState<TeseLite[]>([]);
  const [modo, setModo] = useState<"ia" | "mock" | null>(null);
  const [dados, setDados] = useState<DadosExtraidos>({});
  const [perguntas, setPerguntas] = useState<PerguntaConfirmacao[]>([]);
  const [respostas, setRespostas] = useState<RespostaPergunta[]>([]);
  const [metaArquivo, setMetaArquivo] = useState<{
    nome: string | null;
    paginas?: number;
    caracteres?: number;
  } | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  const [editorHtml, setEditorHtml] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/teses")
      .then((r) => r.json())
      .then(setTodasTeses)
      .catch(() => {});
  }, []);

  const placeholders = useMemo(() => {
    const set = new Set<string>();
    const re = /\{\{([A-Z0-9_]+)\}\}/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(editorHtml)) !== null) set.add(m[1]);
    return Array.from(set);
  }, [editorHtml]);

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
      setDados(data.dados || {});
      setModo(data.modo);
      setMetaArquivo({
        nome: data.arquivo,
        paginas: data.paginas,
        caracteres: data.caracteres,
      });
      const perg = (data.perguntas || []) as PerguntaConfirmacao[];
      setPerguntas(perg);
      setRespostas(perg.map(() => null));
      // pré-marca todas as sugeridas com confiança >= 0.5
      const pre = new Set<string>(
        (data.sugestoes as Sugestao[])
          .filter((s) => s.confianca >= 0.5)
          .map((s) => s.teseId),
      );
      setSelecionadas(pre);
      // Se houver perguntas, força a tela de confirmação primeiro
      setStep(perg.length > 0 ? "confirmacao" : "sugestoes");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
      setStatusMsg(null);
    }
  }

  function toggle(teseId: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(teseId)) next.delete(teseId);
      else next.add(teseId);
      return next;
    });
  }

  async function montar() {
    if (selecionadas.size === 0) {
      setErro("Selecione ao menos uma tese.");
      return;
    }
    setErro(null);
    setLoading(true);
    try {
      const r = await fetch("/api/montar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teseIds: Array.from(selecionadas), dados }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Falha ao montar");
      setEditorHtml(data.html);
      setStep("editor");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function baixarDocx() {
    setErro(null);
    setLoading(true);
    try {
      const r = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          html: editorHtml,
          filename: `contestacao-${dados.numeroProcesso ?? "peticao"}`,
        }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || "Falha ao gerar .docx");
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contestacao-${dados.numeroProcesso ?? "peticao"}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  function voltar() {
    if (step === "editor") setStep("sugestoes");
    else if (step === "sugestoes") setStep(perguntas.length > 0 ? "confirmacao" : "input");
    else if (step === "confirmacao") setStep("input");
  }

  function resetar() {
    setArquivo(null);
    setSugestoes([]);
    setSelecionadas(new Set());
    setMetaArquivo(null);
    setDados({});
    setPerguntas([]);
    setRespostas([]);
    setEditorHtml("");
    setErro(null);
    setStep("input");
  }

  function responder(idx: number, resposta: RespostaPergunta) {
    setRespostas((prev) => {
      const next = [...prev];
      next[idx] = resposta;
      return next;
    });
  }

  const todasRespondidas = respostas.every((r) => r !== null);

  // Combina sugestões da IA + restante do catálogo (sem duplicar)
  const teseListaCombinada = useMemo(() => {
    const sugByTeseId = new Map(sugestoes.map((s) => [s.teseId, s]));
    const naoSugeridas = todasTeses.filter((t) => !sugByTeseId.has(t.id));
    return { sugeridas: sugestoes, outras: naoSugeridas };
  }, [sugestoes, todasTeses]);

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
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-2 text-xs text-ink-500 md:flex">
              <StepBadge active={step === "input"} label="1. Enviar" />
              <Sep />
              <StepBadge active={step === "confirmacao"} label="2. Confirmar" />
              <Sep />
              <StepBadge active={step === "sugestoes"} label="3. Teses" />
              <Sep />
              <StepBadge active={step === "editor"} label="4. Editor" />
            </nav>
            <Link
              href="/admin"
              className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-100"
            >
              Admin
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

        {step === "input" && (
          <section className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold">
              Envie a petição inicial ou o arquivo único do processo
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              A IA vai ler o documento, extrair os dados (vara, partes, processo, valor) e sugerir as teses aplicáveis do banco do escritório.
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
                {statusMsg ??
                  "Aceita PDFs com texto. PDFs digitalizados (imagem) precisam de OCR."}
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

        {step === "confirmacao" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Confirme o que a IA leu na petição inicial
                </h2>
                <p className="text-sm text-ink-500">
                  Responda cada item. Isso garante que você leu a inicial e
                  validou a interpretação da IA antes de seguir.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {modo === "mock" && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    modo mock
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

            <ul className="space-y-3">
              {perguntas.map((p, i) => {
                const r = respostas[i];
                const concorda =
                  r !== null && r === p.respostaSugerida;
                return (
                  <li
                    key={i}
                    className={`rounded-xl border p-4 shadow-sm ${
                      r === null
                        ? "border-ink-200 bg-white"
                        : concorda
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-amber-300 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-ink-900">
                          {i + 1}. {p.pergunta}
                        </p>
                        {p.trecho && (
                          <p className="mt-2 border-l-2 border-ink-300 pl-3 text-xs italic text-ink-500">
                            “{p.trecho}”
                          </p>
                        )}
                        <p className="mt-2 text-[11px] text-ink-400">
                          IA sugeriu: <span className="font-medium uppercase">{p.respostaSugerida}</span>
                          {r !== null && !concorda && (
                            <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-amber-900">
                              divergência registrada
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => responder(i, "sim")}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            r === "sim"
                              ? "bg-emerald-700 text-white"
                              : "border border-ink-300 text-ink-700 hover:bg-ink-100"
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => responder(i, "nao")}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                            r === "nao"
                              ? "bg-red-700 text-white"
                              : "border border-ink-300 text-ink-700 hover:bg-ink-100"
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-ink-500">
                {respostas.filter((r) => r !== null).length} de {perguntas.length} respondida(s).
                {respostas.filter((r, i) => r !== null && r !== perguntas[i].respostaSugerida).length > 0 && (
                  <>
                    {" "}
                    <span className="font-medium text-amber-800">
                      {respostas.filter((r, i) => r !== null && r !== perguntas[i].respostaSugerida).length} divergência(s) com a IA.
                    </span>
                  </>
                )}
              </p>
              <button
                onClick={() => setStep("sugestoes")}
                disabled={!todasRespondidas}
                className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-ink-300"
              >
                Continuar para as teses →
              </button>
            </div>
          </section>
        )}

        {step === "sugestoes" && (
          <section className="grid gap-6 lg:grid-cols-[1fr,280px]">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Selecione as teses para montar a contestação
                  </h2>
                  <p className="text-sm text-ink-500">
                    {metaArquivo?.nome && (
                      <>
                        Baseado em{" "}
                        <span className="font-medium">{metaArquivo.nome}</span>
                        {metaArquivo.paginas ? ` · ${metaArquivo.paginas} pág.` : ""}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {modo === "mock" && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                      modo mock
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

              <h3 className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Sugeridas pela IA
              </h3>
              <ul className="mt-2 space-y-2">
                {teseListaCombinada.sugeridas.length === 0 && (
                  <li className="rounded-md border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-sm text-ink-500">
                    Nenhuma tese sugerida.
                  </li>
                )}
                {teseListaCombinada.sugeridas.map((s) => (
                  <li key={s.teseId}>
                    <CardTese
                      id={s.teseId}
                      nome={s.nome}
                      categoria={s.categoria}
                      justificativa={s.justificativa}
                      confianca={s.confianca}
                      selecionada={selecionadas.has(s.teseId)}
                      onToggle={() => toggle(s.teseId)}
                    />
                  </li>
                ))}
              </ul>

              {teseListaCombinada.outras.length > 0 && (
                <>
                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Outras teses disponíveis no banco
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {teseListaCombinada.outras.map((t) => (
                      <li key={t.id}>
                        <CardTese
                          id={t.id}
                          nome={t.nome}
                          categoria={t.categoria}
                          justificativa={t.resumo}
                          selecionada={selecionadas.has(t.id)}
                          onToggle={() => toggle(t.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <aside className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">Dados extraídos</h3>
              <p className="mt-1 text-xs text-ink-500">
                Você pode ajustar agora ou no editor.
              </p>
              <CamposDados dados={dados} onChange={setDados} />

              <button
                onClick={montar}
                disabled={loading || selecionadas.size === 0}
                className="mt-4 w-full rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-ink-300"
              >
                {loading
                  ? "Montando..."
                  : `Montar contestação (${selecionadas.size})`}
              </button>
            </aside>
          </section>
        )}

        {step === "editor" && (
          <section className="grid gap-6 lg:grid-cols-[1fr,280px]">
            <div className="rounded-xl border border-ink-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base font-semibold">
                    Contestação montada
                  </h2>
                  <p className="text-xs text-ink-500">
                    {selecionadas.size} tese(s) combinada(s). Edite livremente
                    abaixo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={voltar}
                    className="text-sm text-ink-600 hover:text-ink-900"
                  >
                    ← teses
                  </button>
                  <button
                    onClick={baixarDocx}
                    disabled={loading}
                    className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-ink-300"
                  >
                    {loading ? "Gerando..." : "Baixar .docx"}
                  </button>
                </div>
              </div>
              <RichEditor contentHtml={editorHtml} onChange={setEditorHtml} />
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold">Placeholders restantes</h3>
                <p className="mt-1 text-xs text-ink-500">
                  Campos entre <code>{"{{ }}"}</code> que ainda precisam ser preenchidos.
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
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

function CardTese({
  id,
  nome,
  categoria,
  justificativa,
  confianca,
  selecionada,
  onToggle,
}: {
  id: string;
  nome: string;
  categoria: TeseLite["categoria"];
  justificativa: string;
  confianca?: number;
  selecionada: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      htmlFor={`tese-${id}`}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 shadow-sm transition ${
        selecionada
          ? "border-ink-700 bg-ink-50 ring-1 ring-ink-700"
          : "border-ink-200 bg-white hover:border-ink-400"
      }`}
    >
      <input
        id={`tese-${id}`}
        type="checkbox"
        checked={selecionada}
        onChange={onToggle}
        className="mt-1 h-4 w-4 cursor-pointer accent-ink-900"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-ink-900">{nome}</h4>
          <CategoriaBadge categoria={categoria} />
          {confianca !== undefined && <ConfidenceBadge value={confianca} />}
        </div>
        <p className="mt-1 text-sm text-ink-600">{justificativa}</p>
      </div>
    </label>
  );
}

function CategoriaBadge({ categoria }: { categoria: TeseLite["categoria"] }) {
  const tone =
    categoria === "preliminar"
      ? "bg-violet-100 text-violet-800"
      : categoria === "merito"
        ? "bg-sky-100 text-sky-800"
        : "bg-ink-100 text-ink-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tone}`}>
      {LABEL_CATEGORIA[categoria]}
    </span>
  );
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

function CamposDados({
  dados,
  onChange,
}: {
  dados: DadosExtraidos;
  onChange: (d: DadosExtraidos) => void;
}) {
  const set = (k: keyof DadosExtraidos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...dados, [k]: e.target.value });
  const Input = ({
    label,
    field,
  }: {
    label: string;
    field: keyof DadosExtraidos;
  }) => (
    <label className="block text-xs">
      <span className="text-ink-600">{label}</span>
      <input
        value={dados[field] ?? ""}
        onChange={set(field)}
        className="mt-0.5 w-full rounded-md border border-ink-200 bg-white px-2 py-1 text-sm focus:border-ink-400 focus:outline-none"
      />
    </label>
  );
  return (
    <div className="mt-3 space-y-2">
      <Input label="Vara" field="vara" />
      <div className="grid grid-cols-[1fr,80px] gap-2">
        <Input label="Comarca" field="comarca" />
        <Input label="UF" field="uf" />
      </div>
      <Input label="Nº do processo" field="numeroProcesso" />
      <Input label="Autor" field="nomeAutor" />
      <Input label="Tipo da ação" field="tipoAcao" />
      <Input label="Valor pretendido" field="valorPretendido" />
      <Input label="Nº da apólice" field="numeroApolice" />
    </div>
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
