# Ciclo 029 — Fase 29

## Protocolo de entrada

- Fase: 29, NexCopy.
- Produto atual: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 28 aprovada, com NexMotion e movimento reduzido.
- Objetivo: revisar formulários, ações, erros, confirmações, estados vazios,
  carregamento, offline, avisos, sucesso e tooltips.
- Dependências: componentes compartilhados, catálogos PT/EN/ES e suíte E2E.
- Dados: sem alteração de schema, registros ou contratos de persistência.
- i18n: novas chaves equivalentes nos três catálogos; contextualização avançada
  permanece para a Fase 30.
- Acessibilidade: ajuda, exemplo e erro associados; carregamento anunciado;
  nenhuma orientação essencial depende de hover, placeholder ou tooltip.
- Offline e GitHub Pages: novo componente incluído no shell precacheado.
- NexShield e NexMotion: contratos preservados, sem nova superfície de dados ou
  animação.

## Implementação

- `Field` aceita ajuda, exemplo fictício, erro, autocomplete e modo de entrada.
- A descrição acessível mantém a ordem ajuda, exemplo e erro.
- Campos centrais de produtos, movimentações, cenários, onboarding e campos
  personalizados agora explicam significado, formato e consequência.
- `EmptyState` classifica primeiro uso, filtro sem resultado, situação positiva,
  indisponibilidade e dados insuficientes.
- `ContentStatus` padroniza loading, offline, sucesso, aviso e erro, usando
  `aria-live` proporcional e `aria-busy` durante carregamento.
- Erros seguem a fórmula “o que ocorreu, por que e como resolver”.
- Ações destrutivas e confirmações descrevem seus efeitos sobre listas, dados e
  histórico.
- Tooltips nativos não carregam informação necessária para concluir tarefas.

## Evidências

- 126 testes unitários aprovados, incluindo estados controlados de conteúdo e
  empty state;
- 9 testes Playwright aprovados; o fluxo NexCopy verifica ajuda, exemplo,
  associação programática e ausência
  de dependência de placeholder ou tooltip;
- validadores conferem contratos, chaves multilíngues, documentação e backlog;
- axe sem violações sérias ou críticas, offline e movimento reduzido aprovados;
- build e validação do GitHub Pages aprovados;
- instalação, validação, E2E e build reproduzidos em clone temporário limpo.

## Bugs encontrados

Não houve regressão funcional na implementação. A auditoria encontrou campos
importantes que possuíam apenas rótulo e estados de carregamento criados de
formas diferentes; ambos foram corrigidos pelo contrato compartilhado.

## Migrações e ADR

Não há migração. Nenhum ADR novo foi necessário porque a mudança permanece na
camada de apresentação e conteúdo, sem alterar dependências arquiteturais.

## Gate

Aprovado. Nenhum campo importante dos fluxos revisados depende de interpretação
técnica implícita; ajuda, exemplo e recuperação são textuais e programaticamente
associados.

## Próxima fase

Fase 30: NexCopy contextual.
