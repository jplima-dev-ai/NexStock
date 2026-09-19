# Ciclo 004 — Fase 4

## Objetivo

Entregar a fundação multilíngue do NexStock para pt-BR, en-US e es, com troca
sem recarga, fallback previsível e uso seguro dos assets oficiais.

## Alterações

- Serviço de internacionalização assíncrono e independente do DOM.
- Catálogos equivalentes nos três idiomas exigidos.
- Shell, navegação, tema, rotas, Welcome e estados de interface localizados.
- Seletor nativo de idioma com rótulo, foco preservado e falha comunicada por
  toast.
- Brand Scene restrita a pt-BR por conter texto gravado em português.
- Validação estática e testes unitários e de hospedagem para os catálogos.

## Arquivos modificados

- `locales/pt-BR.json`, `locales/en-US.json` e `locales/es.json`.
- `js/i18n/i18n.js`, `js/app.js`, `js/core/router.js` e
  `js/views/route-view.js`.
- `index.html`, `css/layout.css`, componentes de tema e feedback.
- Validador, testes, README, changelog, arquitetura e backlog.

## Testes executados e aprovados

- `npm run validate`: trinta e dois de trinta e dois testes aprovados.
- Sessenta e nove mensagens com chaves equivalentes nos três catálogos.
- Slogans oficiais, mensagens não vazias e ausência de HTML nos catálogos.
- Fallback para pt-BR, interpolação, locale inválido e chave desconhecida.
- Entrega dos três JSONs no servidor estático em subdiretório.
- Brand Scene exclusiva de pt-BR; mascote em en-US e símbolo em es.
- Sintaxe de todos os módulos e ausência de whitespace inválido.

## Bugs encontrados

Nenhum bug residual conhecido. A implementação impede perda de rota e tema ao
trocar o idioma e devolve o foco ao seletor após a operação assíncrona.

## Pendências

- A tentativa de teste com Playwright não pôde iniciar porque a imagem deste
  ambiente não contém um executável Chromium. A inspeção interativa em
  navegador, o zoom de duzentos por cento e o NVDA permanecem não executados e
  não são contabilizados como aprovados.

## Gate

APROVADO. `npm run validate` termina sem erros, todos os textos funcionais do
shell e das views atuais vêm dos catálogos e os contratos de fallback, rota,
foco e asset por idioma estão protegidos no código e por testes automatizados.

## Próxima tarefa

Executar a Fase 5: DataProvider, IndexedDB, migrações, seeds e recuperação
segura de falhas de persistência.
