# Ciclo 074 — Architecture Audit

Fase 74. Release alvo: v2.0.0 Calm Intelligence. A auditoria revisou a
composição da aplicação, Store, EventBus, serviços, contratos de persistência,
IndexedDB, MediaProvider, Supabase opcional, PWA, dependências e dívida.

Foi encontrada uma dívida crítica: `DashboardService` e
`IntelligenceService` formavam um ciclo de imports por causa da regra de
produto parado. A regra pura foi movida para
`inventory-activity-service.js`; Dashboard e Intelligence agora dependem dela,
mas não dependem um do outro. Não houve mudança de cálculo, gravação,
movimentação, auditoria, backup/restauração, Blob de mídia, cache ou interface.

O validador da fase percorre os módulos locais, bloqueia ciclos de imports,
impede que serviços dependam de views/componentes e que providers dependam de
serviços/interface. Também exige que não haja dependências de runtime novas.
O novo módulo foi incluído no precache explícito, preservando o funcionamento
offline após a atualização da aplicação.
O DataProvider continua sendo a fronteira de persistência; IndexedDB permanece
o padrão local-first e Supabase é opcional. O Store conserva somente estado
global e o EventBus mantém eventos de integração sem transportar regras
críticas.

## Gate

APROVADO — nenhuma dívida crítica conhecida é carregada para a v2.0.0.
