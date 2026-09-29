# Ciclo 078 — NexStock 2.0 Release

Fase 78. Release alvo e formalizada: v2.0.0 Calm Intelligence. Os 40 critérios
obrigatórios do blueprint v1.2 foram consolidados em um gate executável e
revalidados por evidências de domínio, integração, E2E, acessibilidade, PWA,
GitHub Pages e documentação.

Esta formalização não acrescenta comportamento de produto. Ela apenas promove o
candidato `2.0.0-rc.1` para `2.0.0`, versiona o novo cache do service worker e
registra a matriz final. Não há migração, novo store IndexedDB, alteração de
provider, backend obrigatório, segredo no cliente, dependência de runtime ou
mudança nos contratos de backup, restore, mídia Blob, NexShield, NexCopy ou
NexMotion.

O checklist valida explicitamente o isolamento do Scenario Lab, Time Machine e
Digital Twin, a preservação de AuditLog em reversões, o fallback do scanner,
pt-BR/en-US/es, teclado, foco, reduced motion, zoom, semântica e a evidência
automatizada que acompanha os fluxos principais usados com NVDA. A validação
real com NVDA continua sendo um teste humano complementar; o projeto não a
alega como automatizada.

## Gate

APROVADO — os 40 critérios de release do blueprint v1.2 têm cobertura
verificável; NexStock v2.0.0 Calm Intelligence está formalizado.
