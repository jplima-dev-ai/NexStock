# Matriz de rastreabilidade da versão 1.0.0

## Objetivo

Esta matriz relaciona cada capacidade central à regra de domínio, persistência,
evidência automatizada e superfície de uso. Ela é o mapa de impacto inicial
para mudanças posteriores à Fase 25.

| Funcionalidade | Serviço ou núcleo | Provider ou persistência | Teste ou gate | Interface ou rota |
| --- | --- | --- | --- | --- |
| Onboarding e perfis | `ProfileService`, `WorkspaceService`, `profile-registry` | `DataProvider`, stores `workspaces`, `settings` e seeds | `profiles.test.js`, `onboarding-model.test.js`, `validate-profiles.mjs` | `onboarding-view.js`, `#/onboarding` |
| Workspace e reset | `WorkspaceService` | `IndexedDBProvider.deleteWorkspace`, seed transacional | `workspace-service.test.js`, `validate-storage.mjs` | `settings-view.js`, `#/settings` |
| Produtos e NexCode | `ProductService` | store `products`, transação com `auditLogs` | `product-core.test.js`, `validate-product-core.mjs` | `product-view.js`, `#/products` |
| Busca e filtros | `ProductService`, `GlobalSearchService` | consultas do provider por workspace | `global-search-service.test.js`, `product-core.test.js` | lista de produtos e Paleta de Comandos |
| Movimentações | `MovementService` | `applyStockMovement` atômico em produto, movimento e auditoria | `movement-service.test.js`, `validate-movements.mjs` | `movement-view.js`, `#/movements` |
| Dashboard e NexPulse | `DashboardService` | leitura de `products` e `movements` | `dashboard-service.test.js`, `validate-dashboard.mjs` | `dashboard-view.js`, `#/dashboard` |
| Insights e previsão | `InsightService` | histórico de `movements` e snapshot de produtos | `insight-service.test.js`, `validate-insights.mjs` | `insight-view.js`, `#/insights` |
| Inventory Story | `inventory-story-service.js` | snapshot derivado, sem gravação | `inventory-story-service.test.js`, `validate-inventory-story.mjs` | Painel e insights |
| Scenario Lab e Comparison | `ScenarioService`, `compareScenarios` | memória apenas, sem provider | `scenario-service.test.js`, `validate-scenario-time-machine.mjs`, `validate-phase-53.mjs` | `scenario-view.js`, `#/scenario` |
| Time Machine 2.0 | `reconstructHistoricalSnapshot`, `DashboardService` | leitura de produtos e movimentos, sem alterar estado | `scenario-service.test.js`, `validate-scenario-time-machine.mjs`, `validate-phase-54.mjs` | `scenario-view.js`, `#/time-machine` |
| Inventory Digital Twin | `createDigitalTwin`, `applyTwinScenario` | cópia imutável em memória, sem provider | `scenario-service.test.js`, `validate-phase-55.mjs` | `scenario-view.js`, `#/digital-twin` |
| Consequence Preview 2.0 | `buildConsequencePreview` | prévia pura antes de `applyStockMovement` | `movement-service.test.js`, `validate-phase-56.mjs` | `movement-view.js`, `#/movements` |
| Campos personalizados | `CustomFieldService` | store `customFieldDefinitions`, auditoria | `custom-field-service.test.js`, `validate-custom-fields.mjs` | `custom-field-view.js`, Configurações |
| Módulos especializados | `ModuleService` | stores de unidades, lotes, relações e kits | `module-service.test.js`, `validate-modules.mjs` | `module-view.js`, `#/kits` e detalhes |
| NexShield 2.0 | `SecurityService`, `security.js`, validadores de backup, importação e mídia | fatos do provider e validações locais; sem acesso ao provider no teste | `security-service.test.js`, `validate-nexshield.mjs`, `validate-phase-57.mjs` | `security-view.js`, `#/settings/security`, `#/shield-test` |
| NexHealth | `HealthService`, `evaluateHealth` | leitura isolada das coleções do workspace, sem escrita | `health-service.test.js`, `validate-phase-58.mjs` | `health-view.js`, `#/health` |
| Audit Explorer | `AuditService`, `createAuditTimeline` | leitura do AuditLog por workspace, sem escrita | `audit-service.test.js`, `validate-phase-59.mjs` | `audit-view.js`, `#/audit` |
| Reversal System | `ReversalService` | transação do provider em produto, compensação e AuditLog; vínculo `reversalOfMovementId` | `reversal-service.test.js`, `validate-phase-60.mjs` | confirmação textual no Audit Explorer |
| Privacy & Data Center | `PrivacyDataCenterService` | fatos derivados do provider ativo; sem escrita, migração, URL ou chave | `privacy-data-center-service.test.js`, `privacy-data-center.spec.js`, `validate-phase-61.mjs` | `privacy-data-center-view.js`, `#/settings/data/privacy` |
| Offline Experience 2.0 | `getOfflineExperienceFacts` | estado derivado de conexão, persistência e sincronização; sem escrita ou Sync Queue | `offline-experience-service.test.js`, `offline-experience.spec.js`, `validate-phase-62.mjs` | `offline-experience-view.js`, `#/settings/pwa` |
| PWA Update Center | `PwaService`, `getPwaUpdateFacts` | service worker relativo e Cache Storage; atualização explícita e adiada em operação crítica | `pwa-service.test.js`, `pwa-update-center.spec.js`, `validate-phase-63.mjs` | `pwa-update-center-view.js`, `#/settings/pwa` |
| NexMigrate | `runMigrations`, `getMigrationCertificate` | migrações de schema aditivas; sem exclusão de stores ou registros | `migrations.test.js`, `migration-service.test.js`, `migration-center.spec.js`, `validate-phase-64.mjs` | `migration-view.js`, `#/settings/advanced` |
| Storage Lifecycle | `StorageLifecycleService`, política do service worker | shell PWA versionado e limitado; IndexedDB, Blob, NexBackup e snapshots sem exclusão automática | `storage-lifecycle-service.test.js`, `storage-lifecycle.spec.js`, `validate-phase-65.mjs` | `storage-lifecycle-view.js`, `#/settings/data/storage` |
| Performance | `performance-service`, cálculos de painel, insights e sinais | índice efêmero de movimentações por produto; sem escrita, migração ou novo store | `performance-service.test.js`, regressões de dashboard e `validate-phase-66.mjs` | mesma interface; sem mudança de foco, teclado ou semântica |
| PWA e rascunhos | `PwaService`, `DraftService` | Cache Storage e `localStorage`; IndexedDB permanece separado | `pwa-service.test.js`, `accessibility-offline.spec.js`, `validate-pwa.mjs` | status global e formulários |
| Internacionalização | `I18n` | catálogos `locales/*.json` | `i18n.test.js`, `validate-locales.mjs`, `validate-copy.mjs` | shell e todas as rotas |
| Tema e responsividade | `theme-toggle`, `mobile-navigation` | Store em memória; preferência de tema | testes de componentes, contraste e `validate-responsive.mjs` | shell e todas as rotas |
| Supabase opcional | `SupabaseProvider`, `provider-factory` | PostgreSQL, RLS e RPC transacional | `supabase-provider.test.js`, `validate-database.mjs` | sem interface própria; seleção por configuração |
| GitHub Pages | router por hash, build estático | artefato `_site`; sem banco remoto obrigatório | `static-hosting.test.js`, `validate-pages.mjs`, `verify-clean-clone.mjs` | aplicação completa em subdiretório |
| Testing Foundation 2.0 | Playwright, Chromium e axe-core | contextos isolados com IndexedDB, Cache Storage e service worker reais | `tests/e2e/*.spec.js`, `validate-phase-26.mjs` | rotas e fluxos principais em pt-BR, en-US e es |
| NexDesign 2.0 | tokens CSS e componentes `card`, `table`, `status-badge` e `icon` | sem persistência; tema no Store em memória | `icon.test.js`, `table.test.js`, `design-system.spec.js`, `validate-phase-27.mjs` | shell, cards, tabelas, estados e temas em todas as rotas |
| NexMotion | tokens CSS, `tabs`, diálogos e classes de entrada | sem persistência; preferência do sistema via media query | `motion.spec.js`, `validate-phase-28.mjs` | rotas, Insights, Paleta de Comandos, navegação, cards, estados e feedback |
| NexCopy | `field`, `empty-state`, `content-state` e catálogos de mensagens | sem persistência; conteúdo distribuído pelos três catálogos equivalentes | `content-state.test.js`, `copy.spec.js`, `validate-phase-29.mjs` | formulários, ações, confirmações, estados e feedback dos fluxos principais |
| NexCopy contextual | `copy-service`, `glossary-view` e contexto do workspace | reutiliza `experienceMode` e `profileKey`; sem novo store ou migração | `copy-service.test.js`, `glossary.test.js`, `contextual-copy.spec.js`, `validate-phase-30.mjs` | formulários de produtos, movimentações, cenários, campos personalizados e `#/glossary` |
| NexSettings | `settings-view`, router e painéis existentes | reutiliza workspace e serviços atuais; sem novo store ou migração | `settings-view.test.js`, `settings-navigation.spec.js`, `validate-phase-31.mjs` | `#/settings` e oito rotas profundas de configuração |
| Settings Summary | `SettingsService` e `settings-view` | atualiza campos controlados do workspace no provider atual; sem novo store ou migração | `settings-service.test.js`, `settings-navigation.spec.js`, `validate-phase-32.mjs` | resumo, Geral, Aparência e confirmação em Dados |
| Import Center | `ImportService`, parser CSV e `import-view` | leitura de produtos, categorias e fornecedores; gravação conjunta em `products` e `auditLogs`; sem novo store ou migração | `import-service.test.js`, `import-center.spec.js`, `validate-phase-33.mjs` | `#/settings/data/import` |
| Export Center | `ExportService`, serializadores CSV/JSON e `export-view` | leitura isolada por workspace nos stores existentes; RLS permanece no provider remoto; sem gravação ou migração | `export-service.test.js`, `export-center.spec.js`, `validate-phase-34.mjs` | `#/settings/data/export` |

## Regra de manutenção

Toda nova funcionalidade ou substituição relevante deve atualizar a linha
afetada ou criar uma nova linha. Mudanças arquiteturais precisam de ADR quando
alterarem responsabilidade, direção de dependência ou contrato persistente.
