# Mobilidade de dados

## Import Center

O fluxo de importação separa leitura, revisão e gravação. O navegador lê o CSV
localmente; nenhum arquivo é enviado a um serviço externo. O parser aceita
vírgula, ponto e vírgula ou tabulação, valores entre aspas, até 2 MB e 1.000
linhas de dados.

O usuário mapeia as colunas para os campos do produto e recebe uma prévia
editável. Antes de qualquer gravação, `ImportService` valida:

- nome, quantidades, preços e modo de rastreamento;
- categoria e fornecedor existentes no workspace;
- nomes duplicados no arquivo ou nos produtos já cadastrados;
- presença dos mapeamentos obrigatórios.

Cada erro permanece associado à linha e ao campo. A interface mostra
“Nenhuma alteração foi feita ainda.” durante toda a prévia. Um plano com ao
menos um erro não pode alcançar a confirmação.

## Confirmação e integridade

Ao confirmar, o serviço recarrega o contexto do workspace e revalida todas as
linhas. Isso impede que uma alteração concorrente transforme um plano antigo
em importação insegura. Somente então gera os NexCodes sequenciais, produtos e
registros `PRODUCT_IMPORTED`.

No provider IndexedDB padrão, produtos e auditorias são enviados em uma única
chamada `bulkPut`, cuja transação abrange todos os stores envolvidos. Portanto,
ou toda a importação local é concluída, ou nenhuma linha é gravada. Um plano
inválido ou desatualizado não chama o método de gravação.

## Persistência e evolução

A funcionalidade reutiliza os stores `products`, `categories`, `suppliers`,
`settings` e `auditLogs`. Não adiciona store, índice ou campo obrigatório e,
por isso, não exige migração de banco. O `DataProvider` permanece a fronteira
de persistência, preservando a arquitetura local-first e o provider opcional.

## Export Center

O `ExportService` oferece cinco conjuntos controlados: produtos,
movimentações, lotes, auditoria e workspace. Cada conjunto possui uma lista
explícita de campos; propriedades internas não entram por propagação acidental.
Todas as consultas usam o identificador do workspace ativo. No provider remoto,
as mesmas leituras continuam submetidas às políticas RLS do banco.

Os filtros atuais podem restringir texto, produto, data, estado de
arquivamento e tipo de movimentação quando aplicáveis. A prévia e o arquivo
final derivam do mesmo plano imutável, evitando divergência entre o que foi
revisado e o que será exportado.

O CSV usa BOM UTF-8, escapa aspas e neutraliza células iniciadas por `=`, `+`,
`-` ou `@`, reduzindo o risco de execução de fórmulas em planilhas. O JSON
registra schema, instante, conjunto, filtros e contagem. A impressão contém
todos os registros filtrados e remove os controles e a navegação do papel.

Exportar é uma operação somente de leitura. Nenhum store, índice ou registro é
criado ou alterado, portanto a Fase 34 não exige migração.
