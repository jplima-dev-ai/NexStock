# Ciclo 061 — Privacy & Data Center

Fase: 61. Produto atual: NexStock 1.7.0. Release alvo: 1.7.0 Trust & Integrity.
Gate anterior: Reversal System aprovado. Objetivo: tornar compreensível onde os
dados ficam, qual provider está ativo e como backup, snapshots e sincronização
se comportam.

A rota `#/settings/data/privacy` deriva fatos do provider já configurado. Com
IndexedDB, informa que os dados ficam neste navegador e dispositivo e que não
há sincronização automática. Com Supabase opcional, informa somente que existe
provider remoto configurado; URL e chave nunca entram no relatório ou na tela.
NexBackup continua sendo um arquivo manual controlado pela pessoa usuária e os
snapshots são mantidos pelo provider ativo. Não houve escrita, coleta, nova
dependência ou migração de IndexedDB.

Impactos: a rota por hash preserva GitHub Pages; o service worker pré-cacheia o
serviço e a interface para uso offline. NexShield mantém os testes isolados;
NexCopy recebe copy factual completa em pt-BR, en-US e es; NexMotion reutiliza
componentes sem impor animação. A superfície usa título, alerta textual,
`dl` semântico e links focáveis por teclado. Validação manual informada: NVDA
funciona bem no site.

## Gate

APROVADO. O gate “localização dos dados é compreensível” foi validado pela
suíte direcionada, 188 testes unitários e 32 testes E2E. A validação cobriu
teclado, foco, semântica, contraste, zoom e reduced motion; o axe não apontou
violações sérias ou críticas. O catálogo equivalente foi aprovado em pt-BR,
en-US e es; PWA/offline e GitHub Pages também foram validados. NVDA funciona
bem no site conforme validação manual informada.
