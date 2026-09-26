# Design System

## Objetivo

O Design System impede que views recriem controles essenciais e acumulem
diferenças de semântica, foco, contraste ou comportamento responsivo.

## Componentes implementados

- Button e IconButton: variantes controladas, alvo mínimo e nome acessível.
- Field e ErrorMessage: label, ajuda, exemplo fictício, obrigatório, erro,
  `aria-invalid` e `aria-describedby` sincronizados.
- Checkbox e Radio: controles nativos com labels reais.
- Card e MetricCard: conteúdo, descrição e ações sem altura rígida.
- StatusBadge: estado sempre expresso por texto, nunca apenas por cor.
- Table: caption, cabeçalhos de coluna e rolagem horizontal local.
- Tabs: tablist, tabs e painéis associados, com setas, Home e End.
- Alert: mensagem estática por padrão; `role="alert"` somente quando urgente.
- Toast: notificação persistente até dispensa explícita.
- Dialog: elemento nativo, nome, descrição, Escape e retorno de foco.
- EmptyState: título humano, explicação, ação, categoria semântica e ilustração
  decorativa opcional.
- ContentStatus: carregamento e outros estados assíncronos com anúncio
  previsível, urgência controlada e `aria-busy` quando aplicável.

## NexMotion

Os tokens de duração e easing controlam movimentos curtos de rota, abas,
diálogos, navegação, cards, badges, métricas e feedback. Nenhum movimento é
necessário para compreender o estado ou concluir uma ação. Não há loops,
parallax, contadores animados ou scroll reveal.

## Regras de uso

Views importam os componentes em vez de criar botões, campos, tabelas, alertas
ou dialogs manualmente. Conteúdo vindo do usuário deve ser atribuído por
`textContent`; os componentes não aceitam HTML arbitrário.

O contrato de conteúdo é detalhado em [NexCopy](content-design.md). Orientação
essencial deve permanecer visível; tooltip nunca substitui label, ajuda, exemplo
ou mensagem de validação.

## Acessibilidade

Os controles importantes possuem altura mínima de 44 pixels. Dialogs respeitam
o viewport e devolvem o foco ao acionador. Tabelas mantêm semântica tabular e
limitam a rolagem horizontal ao próprio container. Erros de campo permanecem
associados ao controle durante a recuperação.

Com `prefers-reduced-motion: reduce`, animações e transições do NexMotion são
removidas, mantendo foco, conteúdo, estado e operação por teclado.

Testes automatizados protegem contratos estáticos e funções puras. Testes
manuais com NVDA e navegador real continuam obrigatórios antes da release.
