# Ciclo 038 — NexQuery

## Entrega

NexQuery transforma consultas locais controladas em filtros explícitos na lista
de produtos. Exemplos: `produtos críticos`, `sem estoque`, `produtos
arquivados`, `produtos com serial`, `produtos com validade` e `buscar Quantum
SSD`.

## Contrato

O parser aceita apenas padrões conhecidos em português, inglês e espanhol. Cada
resultado informa a ação e os filtros que serão aplicados: status, arquivamento,
módulo ou texto. Uma pergunta não suportada não gera recomendação, filtro ou
resposta inventada.

## Acessibilidade e gate

- a consulta aparece na Paleta de Comandos como opção identificada e com
  descrição textual;
- `Enter` abre a lista já filtrada, sem exigir mouse;
- todos os filtros continuam visíveis e podem ser limpos individualmente pelo
  botão “Limpar filtros”;
- testes unitários verificam os padrões e Chromium confirma o filtro de estoque
  iniciado pelo teclado.
