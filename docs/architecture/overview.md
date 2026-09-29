# Visão geral da arquitetura

## Fluxo de dependências

O NexStock está implementado em quatro camadas, sempre nesta direção:

1. Views e componentes recebem eventos e apresentam estado.
2. Serviços aplicam regras de domínio e coordenam operações.
3. A interface DataProvider define contratos de persistência.
4. IndexedDBProvider e SupabaseProvider implementam o contrato; IndexedDB é o
   padrão local-first e Supabase permanece opcional.

Views não acessam providers diretamente. O Store conserva apenas estado global
essencial e não duplica coleções completas do banco.

## Navegação

A aplicação usa fragmentos de URL, como `#/dashboard`. Essa decisão permite
navegação interna e acesso em subdiretórios do GitHub Pages sem configuração de
rewrite no servidor. Após cada mudança válida, o título é atualizado, a view é
renderizada e o foco vai para o título principal.

## Estado atual

A versão 1.2.0 contém shell, rotas, EventBus, Store, Design System,
internacionalização, PWA, providers, serviços de domínio e módulos
especializados. Movimentações usam uma única transação sobre produto, histórico
e auditoria, com bloqueio otimista da quantidade exibida na prévia. O Dashboard
deriva um snapshot textual de produtos e movimentos, sem duplicar coleções no
Store. Insights usam o histórico persistido, expõem cálculos e não alteram o
estado real. Scenario Lab e Time Machine também permanecem isolados do estoque
real. A camada de mobilidade acrescenta importação validada, exportação filtrada,
backup transacional e snapshots locais; o Command Center transforma comandos de
produto controlados em navegação com contexto, sem adicionar um parser aberto.

A rastreabilidade entre funcionalidades, serviços, providers, testes e
interfaces está em [Matriz de rastreabilidade](feature-traceability.md).

## Auditoria de arquitetura da Fase 74

O ciclo entre Dashboard e Intelligence foi removido: a regra de atividade de
estoque é um módulo puro compartilhado, sem persistência ou interface. O gate
automatizado verifica ciclos de imports, impede inversões entre serviços,
providers e interface, e confirma que não há dependências de runtime. A decisão
está registrada no ADR 0003.
