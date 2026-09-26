# Ciclo 037 — Command Center 2.0

## Entrega

Evolui a Paleta de Comandos (`Ctrl+K`) para reconhecer ações dirigidas por
produto: `entrada Quantum`, `saída Quantum`, `abrir Quantum SSD` e `simular
Quantum`. A seleção por `Enter` leva ao fluxo adequado; entrada e saída já
selecionam produto e tipo de movimentação, e a simulação abre o Scenario Lab
com o produto selecionado.

## Limites deliberados

O reconhecimento é restrito a comandos de operação e seus aliases em PT, EN e
ES. Consultas analíticas e filtros em linguagem natural permanecem na Fase 38
(NexQuery), sem prometer interpretação aberta nesta fase.

## Acessibilidade e gate

- `Ctrl+K`, setas, `Enter` e `Escape` são suficientes para abrir, escolher,
  executar e retornar o foco;
- os resultados continuam opções semânticas, com item ativo exposto por
  `aria-activedescendant` e contagem anunciada;
- textos das ações estão disponíveis em pt-BR, en-US e es;
- teste unitário cobre a interpretação controlada; Chromium cobre entrada e
  simulação iniciadas somente pelo teclado.
