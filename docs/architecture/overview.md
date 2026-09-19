# Visão geral da arquitetura

## Fluxo de dependências

O NexStock será implementado em quatro camadas, sempre nesta direção:

1. Views e componentes recebem eventos e apresentam estado.
2. Serviços aplicam regras de domínio e coordenam operações.
3. A interface DataProvider define contratos de persistência.
4. IndexedDBProvider e, futuramente, SupabaseProvider implementam o contrato.

Views não acessam providers diretamente. O Store conserva apenas estado global
essencial e não duplica coleções completas do banco.

## Navegação

A aplicação usa fragmentos de URL, como `#/dashboard`. Essa decisão permite
navegação interna e acesso em subdiretórios do GitHub Pages sem configuração de
rewrite no servidor. Após cada mudança válida, o título é atualizado, a view é
renderizada e o foco vai para o título principal.

## Estado atual

A fundação contém shell, rotas, EventBus, Store, Design System e
internacionalização. A persistência local está implementada por meio do contrato
DataProvider, IndexedDBProvider, migrações aditivas, WorkspaceService,
ProductService, MovementService, DashboardService, InsightService e seeds
fictícios.
Movimentações usam uma única
transação sobre produto, histórico e auditoria, com bloqueio otimista da
quantidade exibida na prévia. O Dashboard deriva um snapshot textual de produtos
e movimentos, sem guardar coleções duplicadas no Store. PWA, módulos avançados
Insights usam apenas histórico persistido, expõem cálculos e não alteram o
estado real. PWA, módulos avançados e o provider Supabase pertencem às fases
posteriores.
