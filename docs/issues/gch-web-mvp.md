# GCH Web — MVP

## Objetivo

App local com alias `gch` para ver o activity log do GCH e navegar/editar o grafo em `GCH_ROOT`.

## Escopo

- Dashboard + feed do activity JSONL (`logs/YYYY-MM-DD.jsonl`)
- Browser da árvore sob `GCH_ROOT` (g4/, .agents/, logs/, raiz)
- Read com Context Economy (brief acima de `---` / detalhes completos)
- CRUD de markdown (create / update / delete com confirmação)
- Porta `5174`; launcher `scripts/launch-gch-web.sh` → `~/.local/bin/gch`

## Fora

- Editar JSONL de activity
- `create_adr` / `ack_relation` dedicados
- Auth

## Env

```bash
GCH_ROOT=/mnt/c/Users/caiod/.global-context
GCH_LOGS_DIR=$GCH_ROOT/logs
GCH_WEB_PORT=5174
```

## API

| Método | Path | Função |
|---|---|---|
| GET | `/api/activity?days=&tag=&status=&agent=&q=` | entries + stats + calendar |
| GET | `/api/nodes?path=` | listagem |
| GET | `/api/nodes/read?path=&details=0\|1` | conteúdo |
| PUT | `/api/nodes` | create/update `{ path, content }` |
| DELETE | `/api/nodes?path=` | delete arquivo |

## Seams (TDD)

1. `parseActivityJsonl` — linhas → entries tipadas
2. `buildActivityStats` / filtros — status, tag, agent, open refs
3. `buildActivityCalendar` — grade GitHub-like
4. `resolveSafePath` — sandbox sob `GCH_ROOT`
5. `splitContextBrief` — brief vs corpo completo
6. write/delete markdown via FS helpers sandboxed

## DoD

- [ ] `gch` sobe o app e abre o browser
- [ ] Dashboard/feed leem JSONL reais
- [ ] Navegar `GCH_ROOT` + ler brief/detalhes
- [ ] CRUD markdown
- [ ] Porta ≠ 5173
- [ ] lint / tsc / vitest verdes
