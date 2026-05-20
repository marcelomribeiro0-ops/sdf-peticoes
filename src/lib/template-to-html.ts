/**
 * Converte o texto bruto de um template (com \n\n entre parágrafos)
 * em HTML pronto para ser carregado no TipTap.
 * Detecta títulos de capítulo (ex: "I – ..." ou "1.1 – ...") e os marca em negrito.
 */
const TITULO_RE = /^(?:[IVXLCDM]+\s*[–\-]\s|^[\dIVXLCDM]+\.\d+\s*[–\-]\s)/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function templateToHtml(texto: string): string {
  const blocos = texto.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  return blocos
    .map((bloco) => {
      const trimmed = bloco.trim();
      if (!trimmed) return "";
      const linhas = trimmed.split("\n").map((l) => escapeHtml(l));
      const html = linhas.join("<br>");
      const isTitulo =
        TITULO_RE.test(trimmed) ||
        /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s\d–\-.,()]+$/.test(trimmed.slice(0, 80)) &&
          trimmed.length < 120;
      return isTitulo
        ? `<p><strong>${html}</strong></p>`
        : `<p>${html}</p>`;
    })
    .filter(Boolean)
    .join("");
}
