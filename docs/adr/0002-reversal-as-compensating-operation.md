# ADR 0002 — Reversão por operação compensatória

## Contexto

Editar ou apagar uma movimentação alteraria a evidência operacional. A reversão
também precisa permanecer atômica nos providers local e opcional remoto.

## Decisão

Uma reversão cria uma nova movimentação com `reversalOfMovementId` e um novo
AuditLog com os IDs original e compensatório. Somente entradas e saídas são
elegíveis. O provider bloqueia uma segunda reversão e saldo negativo na mesma
transação.

## Consequências

O histórico permanece imutável e compreensível. O IndexedDB não precisa de
migração estrutural. Instalações Supabase existentes aplicam a migração SQL
aditiva antes da nova função RPC; nenhuma coluna ou histórico é removido.
