# Ciclo 064 — NexMigrate

Fase 64. Release alvo: v1.8.0 Local-first Excellence. NexMigrate certifica a
versão do schema local e declara a política aditiva: criar stores e índices sem
apagar registros existentes silenciosamente.

Os testes exercitam o caminho de schema antigo para o atual e preservam um
registro histórico imutável. Não houve backend, migração destrutiva, mudança de
backup ou alteração do Blob de Product Media.

## Gate

APROVADO — migrações antigas → atuais preservam dados. A suíte direcionada
valida schema atual, upgrade de versão antiga, versão futura em atenção e a
preservação de registro histórico. A confirmação rápida por teclado no Command
Center passou a aguardar a consulta correspondente, eliminando a seleção de um
resultado anterior. Em 2026-09-27, 192 testes unitários e 35 cenários E2E
passaram, inclusive em repetição integral da suíte.
