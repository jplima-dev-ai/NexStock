# Ciclo 065 — Storage Lifecycle

Fase 65. Release alvo: v1.8.0 Local-first Excellence. A política de ciclo de
armazenamento separa claramente o shell da PWA, dados de estoque, mídia Blob,
NexBackup e snapshots locais.

O cache contém apenas o shell versionado conhecido e só remove caches anteriores
depois da ativação de uma versão nova. Inventário, AuditLog e mídia não são
limpos pelo service worker. Dados são alterados somente por fluxos existentes e
confirmados; o NexBackup continua manual, e snapshots têm limite explícito sem
exclusão silenciosa. A nova tela de Dados é somente de leitura e usa a Storage
API do navegador apenas quando ela estiver disponível.

## Gate

APROVADO — cache, dados, mídia, backup e snapshots possuem política coerente.
Os testes unitários verificam a política e a leitura sem escrita; E2E valida a
explicação acessível da retenção e a suíte axe inclui a nova rota. Em
2026-09-28, o GitHub Actions aprovou 194 testes unitários e 36 cenários E2E.
