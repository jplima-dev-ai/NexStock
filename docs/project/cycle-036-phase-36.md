# Ciclo 036 — Fase 36

## Protocolo de entrada

- Fase: 36, Snapshots locais.
- Produto de entrada: `1.1.0`, com Fases 0 a 35 aprovadas.
- Release alvo: `1.2.0 — Data Mobility`.
- Gate: a restauração não pode quebrar histórico ou versão.

## Implementação

- Snapshots usam o armazenamento local existente, em registros específicos de
  `settings`, sem alterar schema, sem backend obrigatório e sem trocar o
  IndexedDB.
- Cada snapshot contém uma cópia NexBackup versionada e validada do estado
  suportado do workspace; snapshots não são incluídos em backups exportáveis.
- São permitidos até oito snapshots locais. O limite é explícito: a aplicação
  não apaga pontos anteriores automaticamente.
- A importação CSV cria um snapshot antes da confirmação. A restauração de um
  backup também cria um snapshot antes da substituição.
- Restaurar um snapshot primeiro cria outro ponto de segurança e preserva
  tanto o snapshot escolhido quanto o histórico local durante a transação de
  restauração do backup.

## Experiência e acessibilidade

- A rota `#/settings/data/snapshots` permite criar, listar, restaurar e
  excluir snapshots locais.
- Nome, descrição, estado vazio, datas, quantidade de registros, limites e
  consequências são expostos em texto.
- Restaurar e excluir exigem confirmação separada. Cancelar devolve o foco à
  ação de origem; erros e sucesso são anunciados.
- Há equivalência em pt-BR, en-US e es e cobertura offline no precache.

## Evidências

- Testes unitários cobrem criação, isolamento de backup, limite sem exclusão
  silenciosa, exclusão protegida e restauração com snapshot de segurança.
- Playwright cobre criação nomeada e confirmação de exclusão.
- O gate automatizado verifica serviço, preservação de histórico, rota,
  traduções e recursos no cache.

## Migrações e ADR

Não há migração. A opção de persistir o histórico local no store `settings`
mantém a compatibilidade de IndexedDB e de Supabase sem obrigar infraestrutura
nova; registros de snapshot são excluídos do conteúdo de NexBackup.

## Gate

Aprovado quando os testes integrados concluírem: a restauração mantém
integridade, snapshots existentes e a versão suportada do estado.

## Próxima etapa

Release `v1.2.0 — Data Mobility`, após a verificação conjunta de importação,
exportação, backup e snapshots.
