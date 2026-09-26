# Ciclo 035 — Fase 35

## Protocolo de entrada

- Fase: 35, NexBackup.
- Produto de entrada: `1.1.0`, com Fases 0 a 34 aprovadas.
- Release alvo: `1.2.0 — Data Mobility`.
- Objetivo: criar backup completo do estado persistente de um workspace e
  restaurá-lo somente após validação e confirmação explícita.
- Dados: workspace, categorias, fornecedores, produtos, unidades, lotes,
  movimentações, auditoria, relações, kits, campos personalizados e settings.
  Mídia recebe manifesto explícito; ainda não é persistida nesta fase.

## Implementação

- `BackupService` produz JSON versionado `nexstock-backup-v1`, com limite de
  10 MB e 50.000 registros, contagens e arquivo com nome seguro.
- A inspeção valida versão do aplicativo, estrutura, um único workspace,
  fronteira de workspace, IDs duplicados, NexCode, séries, lotes e referências
  entre produtos, categorias, fornecedores, módulos e kits.
- Arquivos com mídia embutida são rejeitados de forma explícita até a entrega
  do MediaProvider; isso evita uma restauração que pareça completa sem ser.
- A restauração local usa uma única transação IndexedDB: verifica se o
  workspace mudou desde a prévia, remove apenas os registros daquele espaço e
  grava o conjunto validado. Falha ou conflito abortam toda a transação.
- O provider Supabase delega o equivalente transacional ao RPC
  `restore_workspace_backup`; nenhuma sequência parcial de chamadas REST é
  aceita como restore.
- A rota `#/settings/data/backup` oferece download, seleção de JSON, resumo
  focável, aviso de conflito e confirmação destrutiva textual.

## Acessibilidade e operação

- Cada controle possui rótulo e ajuda; estados e erros são anunciados em
  regiões vivas.
- A prévia recebe foco após leitura válida. Cancelar limpa o arquivo e devolve
  o foco ao controle de seleção.
- A confirmação declara que os dados atuais serão substituídos. Nenhuma
  alteração é feita durante a leitura ou a prévia.
- Serviço, view e traduções em pt-BR, en-US e es entram no precache offline.

## Evidências

- Regressões unitárias cobrem criação completa, isolamento, arquivo inválido,
  integridade referencial e restauração por prévia validada.
- Playwright cobre download, revisão, confirmação disponível e recusa de
  arquivo inválido antes da ação destrutiva.
- O gate automatizado confirma contratos, rota, traduções e cache offline.

## Migrações e ADR

Não há migração nem mudança de schema. O DataProvider recebe apenas um contrato
de substituição atômica, preservando IndexedDB como armazenamento local padrão.

## Gate

Aprovado quando a suíte integrada concluir: backup restaurável reproduz o
estado suportado sem alterar o workspace para arquivos inválidos ou conflitos.

## Próxima fase

Fase 36: Snapshots locais.
