# Ciclo 027 — Fase 27

## Protocolo de entrada

- Fase: 27, NexDesign 2.0.
- Produto atual: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 26 aprovada em navegador real e clone limpo.
- Objetivo: consolidar tokens, tipografia, espaçamento, superfícies, cards,
  tabelas, estados, temas claro e escuro e iconografia.
- Dados: sem migração e sem alteração dos contratos de persistência.
- Acessibilidade: semântica, nomes, foco e informação textual preservados.
- Responsividade: tabela em cards abaixo de 560 pixels, sem remover a tabela da
  árvore semântica.
- Limite: motion permanece reservado à Fase 28.

## Implementação

- Tokens separados em marca, tema semântico, tipografia, espaçamento, forma,
  elevação, controles e iconografia.
- Escala formal para Display, Heading XL, Heading L, Heading M, Body, Body
  Small, Label, Metric e Mono/Data.
- Superfícies `background`, `surface`, `surface-alt`, `elevated` e `overlay`,
  com valores próprios para o tema escuro.
- Cards com superfícies controladas e elevação aplicada somente quando pedida.
- Tabelas com cabeçalho fixo, ordenação acessível, densidade, seleção, hover,
  foco e adaptação móvel em cards rotulados.
- Estados com texto, cor e ícone vetorial decorativo.
- Catálogo de ícones SVG controlado, sem emojis e sem dependência externa.
- Precache atualizado para o novo módulo de iconografia.

## Evidências

- 123 testes unitários aprovados, incluindo catálogo de ícones e ordenação;
- 6 testes Playwright aprovados em Chromium real;
- tokens computados, temas, iconografia, ordenação, layout móvel e ausência de
  overflow horizontal verificados no navegador;
- axe continua cobrindo as superfícies centrais sem violações sérias ou críticas;
- validação integrada, Pages e clone limpo executam o novo gate.

## Limites honestos

- A validação visual automatizada cobre propriedades e comportamento, não uma
  comparação por pixels entre navegadores.
- NVDA e outros leitores de tela não foram reexecutados nesta fase.
- Motion deliberado não foi antecipado.

## Migrações e ADR

Não há migração de dados. Nenhum ADR novo foi necessário: a mudança consolida
o sistema visual existente sem alterar responsabilidades arquiteturais.

## Gate

Aprovado. Os componentes principais usam o sistema visual único e não há
regressão crítica conhecida na cobertura executada.

## Próxima fase

Fase 28: NexMotion.
