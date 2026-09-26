# Ciclo 033 — Fase 33

## Protocolo de entrada

- Fase: 33, Import Center.
- Produto de entrada: `1.1.0 — Experience Foundation`.
- Release alvo: `1.2.0 — Data Mobility`.
- Gate anterior: Fase 32 aprovada com Settings Summary, salvamento seguro e
  confirmação de alto impacto.
- Objetivo: importar produtos por CSV com mapeamento, validação, correção,
  prévia e confirmação explícita.
- Dependências: NexSettings, Product Core, DataProvider, auditoria, NexCopy,
  NexDesign, NexShield e PWA existentes.
- Dados: reutiliza stores existentes; não há mudança de schema ou migração.
- Acessibilidade: títulos hierárquicos, seleção de arquivo rotulada, fieldsets
  por linha, erros textuais e retorno de foco ao cancelar.
- Offline e GitHub Pages: parser, serviço e view entram no precache relativo.

## Implementação

- Arquivos CSV podem ser selecionados ou arrastados e soltos; vírgula, ponto e
  vírgula e tabulação são detectados automaticamente.
- Cabeçalhos em português, inglês e espanhol recebem sugestões de mapeamento;
  o usuário pode revisar todas as associações.
- A prévia editável valida os dez campos suportados e lista erros por linha.
- Duplicatas são detectadas dentro do arquivo e contra produtos existentes.
- A interface mantém a mensagem obrigatória “Nenhuma alteração foi feita
  ainda.” antes da confirmação.
- O serviço revalida o plano com dados atuais antes de gravar, gera NexCodes
  sequenciais e cria auditoria `PRODUCT_IMPORTED`.
- No IndexedDB, produtos e auditorias compartilham uma única operação atômica
  `bulkPut`.

## Evidências

- 140 testes unitários aprovados, incluindo parser, mapeamento, duplicatas,
  plano desatualizado, NexCode e ausência de gravação inválida;
- 17 testes Playwright aprovados, incluindo correção, confirmação, retorno de
  foco, persistência e preservação após reload;
- 856 mensagens equivalentes em pt-BR, en-US e es;
- axe sem violações sérias ou críticas nas superfícies cobertas, incluindo a
  rota do Import Center;
- offline, teclado, foco, temas, movimento reduzido, build e validação do
  GitHub Pages aprovados;
- instalação, validação, E2E e build reproduzidos em clone temporário limpo.

## Bugs encontrados

Nenhum defeito regressivo foi confirmado. A validação histórica da Fase 32 foi
ajustada para verificar somente sua própria conclusão, sem fixar para sempre a
Fase 33 como próxima entrega.

## Migrações e ADR

Não há migração. Nenhum ADR novo foi necessário: o Import Center respeita a
direção de dependência atual e o contrato persistente do DataProvider.

## Gate

Aprovado. Arquivos e correções permanecem somente na prévia até confirmação;
qualquer linha inválida ou plano desatualizado bloqueia toda a gravação e não
corrompe o workspace.

## Próxima fase

Fase 34: Export Center.
