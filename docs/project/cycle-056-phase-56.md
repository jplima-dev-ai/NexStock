# Ciclo 056 — Consequence Preview 2.0

Antes de confirmar uma movimentação, o NexStock mostra quantidade e status
antes/depois, variação resultante e cobertura estimada quando os registros
locais permitem calculá-la. Sem dados suficientes, a indisponibilidade é
explicada sem inventar uma previsão.

A prévia é pura e não persistida. A execução continua sendo uma ação explícita
separada, confirmada pelo usuário no fluxo de movimentação.

## Gate

APROVADO quando ações importantes exibirem antes/depois quando aplicável e a
prévia não gravar nenhuma alteração.
