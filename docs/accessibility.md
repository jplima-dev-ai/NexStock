# Declaração de acessibilidade

## Objetivo

O NexStock busca conformidade com WCAG 2.2 nível AA onde aplicável e considera
teclado, leitores de tela, ampliação, contraste e reflow como requisitos.

## Controles implementados

- estrutura semântica e títulos hierárquicos;
- link para pular diretamente ao conteúdo principal;
- foco visível e foco movido ao título após mudança de rota;
- formulários com rótulos, ajuda, exemplos fictícios, obrigatoriedade e erros
  associados em uma ordem previsível;
- estados comunicados por texto, não apenas por cor;
- regiões vivas para notificações, conexão e resultados assíncronos;
- diálogos com retorno de foco e operação por teclado;
- alvos interativos de pelo menos quarenta e quatro pixels;
- reflow em 320 pixels e zoom de duzentos por cento.
- ícones decorativos removidos da árvore de acessibilidade, com texto ou nome
  acessível preservado em todas as ações;
- tabelas com legenda, cabeçalhos, ordenação anunciada por `aria-sort` e layout
  móvel que preserva os rótulos de cada célula.
- abas com papéis e relações ARIA, ativação por clique e navegação por setas,
  Home e End;
- `prefers-reduced-motion` remove movimentos decorativos sem ocultar conteúdo,
  atrasar ações ou alterar o gerenciamento de foco.
- carregamentos usam `role="status"` e `aria-busy`; erros urgentes usam anúncio
  assertivo somente quando a intervenção imediata é necessária;
- nenhuma instrução essencial depende de placeholder, hover ou tooltip.
- o modo compacto oculta exemplos adicionais, mas mantém ajuda essencial e
  todas as funcionalidades;
- o glossário usa lista de definições semântica, busca rotulada e região de
  status para anunciar a quantidade de resultados.
- o NexSettings mantém um único título principal, título de seção previsível,
  navegação interna nomeada, página atual anunciada e seletor rotulado no
  mobile.
- o Settings Summary usa títulos e listas de definição; salvamento informa
  progresso e resultado por região de status, restaura valores recusados e
  mantém confirmação explícita antes da restauração de dados.
- o Import Center usa seleção de arquivo visível, títulos hierárquicos,
  fieldsets com legenda para cada linha e campos editáveis rotulados; erros
  são listados por linha e a confirmação devolve foco ao ponto de origem ao
  ser cancelada.
- o Export Center usa controles rotulados, filtros agrupados em fieldset,

- o NexBackup usa botões descritivos, seleção de arquivo rotulada, resumo
  focável, regiões de status e confirmação explícita antes da restauração;
  tabela com caption descritivo e foco movido para a prévia; download e
  impressão são confirmados em região de status.

O link para pular conteúdo intercepta sua própria âncora para não ser confundido
com uma rota pelo roteador baseado em hash.

## Leitores de tela

O fluxo principal recebeu teste exploratório positivo com NVDA no Windows por
um usuário real. Testes automatizados verificam contratos estruturais, mas não
substituem uma matriz manual completa de navegador e tecnologia assistiva.

Na Fase 26, axe passou em Chromium real nas rotas de Boas-vindas, Painel,
Produtos, Movimentações e Configurações, sem violações sérias ou críticas.
Na Fase 31, a cobertura inclui Resumo, Aparência e Segurança do NexSettings.
Na Fase 32, os fluxos automatizados cobrem atalhos, controles rotulados,
salvamento imediato, reload e retorno de foco ao cancelar a confirmação.
Na Fase 33, axe cobre a rota do Import Center e o fluxo E2E verifica campos,
erros por linha, confirmação e retorno de foco. A revisão manual com NVDA deve
ser repetida em Windows antes da publicação final da release 1.2.0.
Nas Fases 34 e 35, axe cobre as rotas do Export Center e do NexBackup; os testes verificam rótulos,
prévia tabular, downloads e impressão filtrada. A validação manual com NVDA
continua pendente para a publicação final da release 1.2.0.

## Limitações conhecidas

- a arte institucional contém texto em português e só é usada no produto com
  o idioma pt-BR;
- screenshots são ilustrativos e possuem descrição textual equivalente;
- a instalação da PWA varia conforme navegador e sistema operacional.
