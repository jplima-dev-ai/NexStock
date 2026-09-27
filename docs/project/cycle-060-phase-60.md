# Ciclo 060 — Reversal System

Fase: 60. Produto atual: NexStock 1.6.0. Release alvo: 1.7.0 Trust & Integrity.
Gate anterior: Audit Explorer aprovado. Objetivo: reverter somente entradas e
saídas por uma nova movimentação compensatória, mantendo o histórico íntegro.

`ReversalService` exige confirmação explícita, verifica workspace, produto
ativo, elegibilidade e saldo atual. A compensação recebe
`reversalOfMovementId`; o novo AuditLog registra ambos os IDs. A transação do
provider bloqueia duplicação e atualiza produto, compensação e auditoria como
uma unidade. Ajustes manuais nunca são elegíveis.

Impactos: nenhuma migração IndexedDB, pois o vínculo é aditivo; schema e RPC
Supabase foram atualizados para a camada opcional. PWA e GitHub Pages continuam
estáticos e offline. A confirmação é textual, operável por teclado e localizada
em pt-BR, en-US e es.

## Gate

APROVADO. O gate “reversões preservam auditoria” foi validado. A suíte direcionada confirmou confirmação explícita, bloqueio de
duplicidade, isolamento de workspace e preservação do movimento e AuditLog
originais. A suíte completa do GitHub Actions aprovou teclado, foco, semântica,
contraste, zoom, reduced motion, i18n, PWA/offline e GitHub Pages.
