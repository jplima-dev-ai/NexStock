# Ciclo 008 — Fase 8

## Fase

Fase 8: movimentações, integridade transacional e Audit Trail.

## Objetivo

Registrar entradas, saídas e ajustes com prévia de impacto, impedindo estoque
negativo e garantindo que produto, movimento e auditoria sejam persistidos
juntos ou não sejam alterados.

## Alterações

- Criado `MovementService` com entradas, saídas e ajustes de quantidade final.
- Implementada prévia com quantidade e status antes e depois da operação.
- Adicionada confirmação explícita que descreve tipo e quantidade.
- Implementada transação IndexedDB única para produto, movimento e AuditLog.
- Adicionado bloqueio otimista para rejeitar prévias desatualizadas.
- Saídas inválidas são recusadas antes de qualquer gravação.
- Criados histórico geral e histórico recente nos detalhes do produto.
- Integrado atalho de movimentação a partir do produto selecionado.
- Adicionadas mensagens equivalentes em pt-BR, en-US e es.

## Testes executados e aprovados

- `npm run validate`: sessenta e três de sessenta e três testes aprovados.
- Entrada, saída, ajuste e transição de status pela fórmula oficial.
- Saída sem saldo sem atualização, movimento ou auditoria parciais.
- Escrita conjunta de produto, movimento e AuditLog.
- Rejeição de confirmação baseada em prévia desatualizada.
- Isolamento de histórico por workspace e produto.
- Duzentas e cinquenta e sete mensagens equivalentes nos três idiomas.

## Validação manual e pendências

- Após a entrega, o usuário abriu o projeto com Live Server e relatou boa
  acessibilidade com NVDA, sem bloqueador informado.
- A matriz estruturada de fluxos, navegadores, teclado e zoom de duzentos por
  cento permanece pendente; o teste exploratório positivo não equivale à
  conformidade completa.
- Dashboard, NexPulse, Radar e prioridades serão implementados na Fase 9 sobre
  os dados íntegros estabelecidos neste ciclo.

## Gate

APROVADO COM RESSALVA DE AMBIENTE. Nenhuma operação validada permite estoque
negativo ou estado parcial; a atualização do produto, o movimento e o AuditLog
pertencem à mesma transação e conflitos de concorrência são recusados.

## Próxima tarefa

Executar a Fase 9: Dashboard, NexPulse, Radar e prioridades.
