# Ciclo 034 — Fase 34

## Protocolo de entrada

- Fase: 34, Export Center.
- Produto de entrada: `1.1.0`, com Fases 0 a 33 aprovadas.
- Release alvo: `1.2.0 — Data Mobility`.
- Gate anterior: importações inválidas ou desatualizadas não gravam nem
  corrompem o workspace.
- Objetivo: exportar produtos, movimentações, lotes, auditoria e workspace em
  CSV, JSON ou impressão, respeitando filtros e permissões aplicáveis.
- Dependências: NexSettings, DataProvider, stores atuais, NexCopy, NexDesign,
  NexShield e PWA.
- Dados: somente leitura; não há mudança de schema ou migração.
- Acessibilidade: títulos hierárquicos, fieldset de filtros, campos rotulados,
  tabela com caption, foco na prévia e status após a ação.
- Offline e GitHub Pages: serviço e view entram no precache relativo.

## Implementação

- `ExportService` restringe consultas ao workspace ativo e usa listas
  explícitas de campos para os cinco conjuntos previstos no blueprint.
- A prévia e o arquivo final compartilham um plano imutável com filtros por
  texto, produto, período, arquivamento e tipo de movimentação.
- CSV recebe BOM UTF-8, cabeçalhos localizados, escape de aspas e neutralização
  de células capazes de iniciar fórmulas em planilhas.
- JSON registra schema, instante, conjunto, filtros, contagem e registros.
- A impressão usa todos os registros filtrados e uma folha sem navegação ou
  controles operacionais.
- O provider remoto mantém suas políticas RLS; o serviço não amplia acesso nem
  mistura dados de outros workspaces.

## Evidências

- 145 testes unitários aprovados, incluindo filtros, datas, isolamento,
  allowlists, CSV seguro e contrato JSON;
- 19 testes Playwright aprovados, incluindo downloads reais, conteúdo dos
  arquivos, impressão e foco da prévia;
- 946 mensagens equivalentes em pt-BR, en-US e es;
- axe sem violações sérias ou críticas nas superfícies cobertas, incluindo a
  rota do Export Center;
- offline, responsividade, temas, teclado, build e GitHub Pages aprovados;
- validação e build reproduzidos em clone temporário limpo.

## Bugs encontrados

O primeiro teste E2E usava uma expressão regular em uma opção que aceita apenas
texto literal. O teste foi corrigido para resolver o valor da opção antes da
seleção; nenhum defeito do produto foi confirmado.

## Migrações e ADR

Não há migração. Nenhum ADR novo foi necessário: a exportação permanece como
serviço de leitura sobre o DataProvider e não altera responsabilidades.

## Gate

Aprovado. Prévia e saída usam os mesmos filtros, o workspace permanece isolado,
as permissões do provider são preservadas e somente campos previstos entram no
arquivo.

## Próxima fase

Fase 35: NexBackup.
