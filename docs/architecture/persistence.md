# Persistência local

## Fluxo de dependências

As views não acessam IndexedDB. A composição ocorre em `js/app.js`, os serviços
aplicam o fluxo de negócio e o provider executa a persistência:

```text
View → Service → DataProvider → IndexedDBProvider → IndexedDB
```

O contrato `DataProvider` centraliza leitura, contagem, gravação, gravação em
lote e remoção isolada por workspace. Isso permite trocar o provider sem
alterar as views ou as regras de domínio.

## Banco e migrações

O banco se chama `nexstock-db`. A versão inicial cria os quinze stores definidos
no blueprint. As migrações ficam em `js/storage/migrations/` e são aditivas:
criam apenas stores ou índices ausentes. Nenhuma migração pode chamar
`deleteDatabase`, `deleteObjectStore` ou limpar stores silenciosamente.

Gravações de seed usam uma única transação envolvendo workspace, categorias,
fornecedores, produtos, metadados e configuração ativa. Uma falha aborta o
conjunto, evitando workspace parcialmente criado.

## Isolamento

Entidades de domínio carregam `workspaceId` e possuem índice correspondente.
O reset recebe um identificador explícito e remove somente registros associados
àquele workspace. O banco completo nunca é apagado pelo fluxo de reset.

## Recuperação

Se IndexedDB estiver indisponível, bloqueado ou receber uma mudança de versão em
outra aba, o NexStock comunica a situação com texto localizado. A aplicação
continua navegável, mas não afirma que alterações serão salvas.

## Seeds

Os arquivos em `demo/` usam somente marcas fictícias. Tecnologia contém Orion
Notebook, Quantum SSD, NovaMesh Router, Orbit Keyboard e Pulse Headset. Os seeds
de cosméticos, moda e alimentos preparam a infraestrutura da próxima fase.
