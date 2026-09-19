# Ciclo 002: Fase 2

Data: 18 de setembro de 2026.

## Fase

Fase 2: Identidade visual.

## Objetivo do ciclo

Integrar o pacote oficial de marca v1.2 nos locais permitidos, estabelecer os
temas claro e escuro e transformar regras visuais em componentes e testes
reutilizáveis.

## Alterações

- Criados componentes canônicos para as seis imagens oficiais.
- App Mark integrado ao shell com o nome NexStock em HTML.
- Welcome em português recebeu Main Logo, slogan em HTML e Brand Scene.
- Onboarding recebeu Stacked Logo, slogan em HTML e Mascot.
- About recebeu Stacked Logo e Brand Symbol.
- Rotas analíticas permaneceram sem mascote ou hero dominante.
- Criado seletor de tema com operação por teclado, rótulo estável e estado
  programático.
- Adicionada superfície clara dedicada para wordmarks no tema escuro.
- Tokens oficiais foram expandidos sem usar âmbar como warning funcional.
- Criada validação binária de dimensões, transparência e fundo dos ícones PWA.
- Criados testes de contraste para texto, ações e foco.

## Arquivos modificados

- `index.html`.
- `package.json`.
- `css/tokens.css`, `css/base.css`, `css/components.css`, `css/layout.css` e
  `css/responsive.css`.
- `js/app.js`, `js/core/version.js`, `js/components/brand.js`,
  `js/components/theme-toggle.js` e `js/views/route-view.js`.
- `scripts/validate-static.mjs` e `scripts/validate-brand-assets.mjs`.
- Testes unitários e de integração.
- README, changelog, backlog e documentação do sistema de marca.

## Testes executados

- `npm run validate`.
- Verificação HTTP dos seis assets oficiais.
- Leitura binária das dimensões PNG e JPEG.
- Descompressão e inspeção de alpha nos PNGs de marca.
- Inspeção do pixel de fundo dos ícones PWA.
- Cálculo automatizado de contraste WCAG para pares essenciais.
- Inspeção visual do painel oficial dos assets.
- Verificação de sintaxe JavaScript e de whitespace.

## Testes aprovados

- Quinze de quinze testes automatizados aprovados.
- Seis de seis assets oficiais carregaram por HTTP.
- Cinco PNGs de marca possuem transparência real e dimensões corretas.
- Hero possui 1920 por 1080 pixels.
- Cinco ícones PWA preservam o fundo oficial `#0B1120`.
- Contraste de texto, ação primária e foco atingiu o mínimo aplicável nos temas
  claro e escuro.
- Inspeção visual confirmou que a Stacked Logo não contém slogan.

## Bugs encontrados

O tema escuro inicialmente usava texto branco sobre o azul claro da ação
primária, combinação insuficiente para texto normal. A causa era um valor fixo
de cor sobre o primário. Foi criado o token semântico `--ns-color-on-primary`,
com azul-marinho no tema escuro, e um teste de regressão de contraste.

O primeiro desenho também faria o leitor de tela receber um rótulo de ação
mutável junto ao estado pressionado do seletor de tema. O controle passou a ter
nome acessível estável, `Tema escuro`, mantendo a ação visual explícita.

## Pendências

- O comportamento específico de Brand Scene em inglês e espanhol será ativado
  junto ao sistema i18n na Fase 4.
- Testes em navegador visual, zoom de duzentos por cento e NVDA não puderam ser
  executados neste ambiente e permanecem marcados como não testados.
- Componentes gerais de formulário, tabela, diálogo, toast e alert pertencem à
  Fase 3.

## Gate da Fase 2

APROVADO. Os seis assets carregam, dimensões e transparência foram verificadas,
a Stacked Logo está sem slogan, o App Mark compõe o shell, os dois temas possuem
pares essenciais de contraste válidos e as rotas analíticas não receberam
branding ilustrativo dominante.

## Próxima tarefa

Executar a Fase 3: implementar o Design System compartilhado com foco, estados,
formulários, tabela, diálogos, alertas, toast e empty states acessíveis.
