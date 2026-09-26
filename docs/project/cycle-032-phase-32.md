# Ciclo 032 — Fase 32

## Protocolo de entrada

- Fase: 32, Settings Summary.
- Produto de entrada: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 31 aprovada com nove seções deep-linkable e reload
  preservando a seção.
- Objetivo: implementar resumo, atalhos, estados, salvamento instantâneo seguro
  e confirmações de alto impacto.
- Dependências: NexSettings, workspace persistido, DataProvider, NexCopy,
  NexDesign, NexShield e PWA existentes.
- Dados: campos controlados são adicionados ao registro do workspace; não há
  novo store, mudança de schema ou migração.
- Acessibilidade: títulos hierárquicos, listas de definição, campos rotulados,
  região de status, erro associado e retorno de foco na confirmação.
- Offline e GitHub Pages: `SettingsService` entra no precache relativo.

## Implementação

- `Settings Summary` apresenta cinco áreas centrais: espaço de trabalho,
  aparência, dados, segurança e PWA.
- Cada card informa estados reais e oferece atalho para a seção correspondente.
- `SettingsService` permite somente nome, moeda, fuso horário, tema e modo de
  experiência, com valores controlados e validação antes da gravação.
- Geral e Aparência salvam imediatamente; o valor anterior é restaurado quando
  a gravação falha.
- Tema e modo persistem no workspace e são restaurados após reload.
- A restauração de dados permanece bloqueada até confirmação explícita; o
  cancelamento devolve o foco ao botão de origem.
- A versão estável passa a `1.1.0 — Experience Foundation`.

## Evidências

- 136 testes unitários aprovados, incluindo validação, preservação de campos,
  workspace ausente e modelo do resumo;
- 15 testes Playwright aprovados, incluindo estados, atalhos, salvamento,
  reload e confirmação;
- 799 mensagens equivalentes em pt-BR, en-US e es;
- axe sem violações sérias ou críticas nas superfícies cobertas;
- offline, teclado, foco, temas, movimento reduzido, build e validação do
  GitHub Pages aprovados;
- instalação, validação, E2E e build reproduzidos em clone temporário limpo.

## Bugs encontrados

A promoção para `1.1.0` revelou uma expectativa histórica do teste de
hospedagem ainda fixada em `1.0.0`. O teste passou a comparar o cache com a
versão declarada no `package.json`, evitando nova divergência em releases
futuras. Nenhum defeito do produto foi confirmado nesse caso.

## Migrações e ADR

Não há migração. Nenhum ADR novo foi necessário: o serviço grava no registro
existente do workspace por meio do contrato atual do DataProvider.

## Gate

Aprovado. As configurações centrais estão resumidas em linguagem direta,
possuem atalhos previsíveis e distinguem alterações seguras de ações que exigem
confirmação.

## Próxima fase

Fase 33: Import Center, início da release `1.2.0 — Data Mobility`.
