# GCH Web

Cockpit local do Global Context Hub: activity log + browser de arquivos sob `GCH_ROOT`.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
# ou:
ln -sf /opt/g4/worktrees/gch-web/scripts/launch-gch-web.sh ~/.local/bin/gch
gch
```

Porta padrão: **5174** (CR Web usa 5173).

## Scripts

| Script | Função |
|---|---|
| `npm run dev` | Vite + API middleware |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b` |
| `npm test` | vitest |

## Spec

Ver `docs/issues/gch-web-mvp.md`.
