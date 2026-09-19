# Ciclo 007 — Fase 7

## Fase

Fase 7: Core de produtos.

## Objetivo

Entregar cadastro, edição, consulta, NexCode, busca, filtros e arquivamento para
todos os perfis usando um único serviço de domínio.

## Alterações

- ProductService ampliado com validação e operações completas.
- NexCode no formato prefixo, categoria e sequência.
- Migração dois com unicidade composta por workspace e NexCode.
- Formulário adaptativo para campos do perfil ativo.
- Listagem semântica, busca tolerante a acentos e filtros limpáveis.
- Detalhes do produto e confirmação explícita de arquivamento.
- Edição impedida de alterar quantidade fora do fluxo de movimentação.
- AuditLog atômico em criação, edição e arquivamento.
- Status oficial: sem estoque, crítico, atenção e saudável.

## Arquivos modificados

- `js/services/product-service.js` e migração dois.
- `js/views/product-view.js`, roteamento e composição da aplicação.
- Componentes Field e StatusBadge, estilos e catálogos.
- Testes, validadores, arquitetura, README, changelog e backlog.

## Testes executados e aprovados

- `npm run validate`: cinquenta e oito de cinquenta e oito testes aprovados.
- NexCode, sequência, unicidade, integridade e isolamento de relações.
- Criação, edição, preservação de quantidade e arquivamento lógico.
- Busca sem distinção de caixa ou acento e filtros de arquivamento.
- Migração composta única e AuditLog atômico.
- Duzentas e dezenove mensagens equivalentes nos três idiomas.

## Bugs encontrados

O caso de teste inicial tratava quantidade oito como saudável para mínimo cinco.
A fórmula oficial define oito como atenção; saudável começa em nove. A
expectativa foi corrigida sem alterar a regra correta do serviço.

Campos numéricos de preço usavam o passo inteiro padrão do navegador. Eles agora
aceitam decimais e bloqueiam valores negativos desde o controle e no domínio.

## Pendências

- Filtros específicos de validade, lote e variações entram com os respectivos
  módulos nas fases posteriores.
- A inspeção interativa em navegador, zoom de duzentos por cento e NVDA
  permanece pendente pela ausência de navegador executável neste ambiente.

## Gate

APROVADO. O mesmo ProductService opera para todos os NexProfiles, consome seus
campos específicos e mantém contratos únicos de NexCode, busca, integridade e
arquivamento.

## Próxima tarefa

Executar a Fase 8: movimentações atômicas, estoque não negativo e AuditLog.
