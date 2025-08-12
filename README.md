# Zotero MCP – Conector personalizado para ChatGPT (Vercel)

Servidor **MCP (Model Context Protocol)** minimalista para consultar sua biblioteca **Zotero** a partir de um **conector personalizado** no ChatGPT.

> **Aviso**: este projeto é para uso pessoal/experimental. Guarde sua `ZOTERO_API_KEY` como **segredo** (Vercel Env). Não exponha a chave em commits.

---

## 🚀 Visão geral
- **/api/sse**: endpoint **SSE** (Server‑Sent Events) que o ChatGPT consome como *MCP server URL*.
- Busca itens na API do Zotero (pessoal ou grupo), com filtros por `q`, `itemType`, `collection`, `limit`, `start`, `sort`, `direction`.
- Pronto para deploy no **Vercel** (plano gratuito), sem dependências externas.

---

## ⚙️ Variáveis de ambiente
Crie as variáveis em **Vercel → Project → Settings → Environment Variables**:

- `ZOTERO_API_KEY` → sua chave privada do Zotero (**read-only** recomendado)
- `ZOTERO_USER_ID` → seu User ID **ou**
- `ZOTERO_GROUP_ID` → Group ID (use **somente um**: USER ou GROUP)

Opcional: crie um arquivo `.env.local` para desenvolvimento local, usando o modelo abaixo:
