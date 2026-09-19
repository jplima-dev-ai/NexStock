# Core de produtos

## Responsabilidades

`ProductService` é usado por todos os NexProfiles e centraliza validação,
NexCode, cadastro, edição, consulta, busca, filtros e arquivamento lógico. Views
não acessam IndexedDB.

## NexCode

O formato é `PREFIXO-CATEGORIA-SEQUÊNCIA`. A sequência possui quatro dígitos e
avança dentro da combinação de prefixo e categoria. A migração dois cria o
índice composto único `workspaceNexCode`, impedindo códigos repetidos no mesmo
workspace sem impor conflito entre workspaces diferentes.

## Integridade

- quantidade, mínimo e preços não aceitam valores negativos;
- categoria e fornecedor precisam pertencer ao workspace ativo;
- edição preserva NexCode e quantidade atual;
- mudanças posteriores de quantidade serão feitas somente por movimentações;
- criação, edição e arquivamento gravam produto e AuditLog na mesma transação;
- arquivamento preenche `archivedAt` e nunca apaga o histórico.

## Busca e filtros

A busca normaliza caixa e acentos e considera nome, NexCode, categoria,
fabricante, fornecedor e campos personalizados marcados como pesquisáveis. Os
filtros atuais cobrem categoria, status e arquivamento e podem ser limpos em uma
única ação.

## Interface

A listagem oferece tabela semântica com as colunas do blueprint, formulário
reutilizado em cadastro e edição, tela de detalhes sem branding ilustrativo e
confirmação explícita antes de arquivar. Status possuem texto além de estilo
visual.
