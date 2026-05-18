# SDF Petições — Agente de IA de Contestação

MVP de um agente que lê uma petição inicial e sugere teses de contestação aplicáveis, abrindo um modelo pré-pronto da tese no editor.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic Claude API (com fallback mock por palavras-chave)

## Rodar localmente

```bash
cp .env.example .env.local
# preencha ANTHROPIC_API_KEY (opcional — sem ela roda em modo mock)

npm install
npm run dev
```

Abra http://localhost:3000.

## Fluxo
1. **Petição inicial** — cole o texto.
2. **Teses sugeridas** — a IA classifica e ranqueia teses do catálogo (`src/lib/teses.ts`).
3. **Editor** — modelo da tese aparece com placeholders `{{PLACEHOLDER}}` para preencher.

## Adicionar/editar teses
Edite `src/lib/teses.ts`. Cada tese tem:
- `id`, `nome`, `resumo`
- `palavrasChave` — usadas pelo fallback mock
- `template` — texto base com `{{PLACEHOLDERS}}`

## Deploy (Hostinger Cloud com Node)
```bash
npm run build
npm run start  # porta 3000 por padrão
```
Configurar o app Node no hPanel apontando para esta pasta, com comando de start `npm run start` e variáveis de ambiente (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`).
