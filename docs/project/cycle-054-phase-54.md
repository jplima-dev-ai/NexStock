# Ciclo 054 — Time Machine 2.0

A Time Machine recebe uma data e deriva um snapshot apenas dos produtos que já
existiam e das movimentações registradas até esse instante. Para cada produto,
usa a última quantidade posterior à data ou a quantidade anterior da próxima
movimentação; nunca escreve no provider ou no IndexedDB.

O resultado apresenta produtos, quantidades, status, movimentações, métricas e
NexPulse histórico quando há produtos no snapshot. A pontuação é acompanhada
por narrativa, dimensões e cobertura de previsão.

## Gate

APROVADO quando a reconstrução histórica permanecer coerente, não aceitar
datas futuras e não alterar o estoque real.
