# Ciclo 028 — Fase 28

## Protocolo de entrada

- Fase: 28, NexMotion.
- Produto atual: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 27 aprovada com sistema visual único.
- Objetivo: aplicar movimento funcional, curto e previsível sem criar barreiras.
- Dados: sem migração e sem alteração dos contratos de persistência.
- Acessibilidade: toda informação permanece textual e disponível sem motion.
- Responsividade: sidebar móvel e abas preservam toque, teclado e reflow.

## Implementação

- Tokens `instant`, `fast`, `base`, `slow` e easings `standard`, `enter`, `exit`.
- Entrada discreta de rotas, cards, painéis de aba, badges, métricas, alertas e
  toasts.
- Transição CSS do diálogo nativo, sem temporizador ou atraso no fechamento.
- Expansão visual da navegação móvel sem alterar `aria-expanded`.
- Componente Tabs com papéis ARIA, relações entre tab e painel, roving tabindex,
  clique, setas, Home e End.
- Previsão e Stock Memory organizadas em abas sem remover conteúdo ou alterar
  cálculos.
- Media query de movimento reduzido remove animações, transições e transforms
  decorativos das superfícies afetadas.
- Não foram adicionados parallax, loops, scroll reveal, confetti, shake ou
  contadores animados.

## Evidências

- 124 testes unitários aprovados;
- 8 testes Playwright aprovados em Chromium real;
- Playwright verifica motion em rota, tabs, diálogo, sidebar, badge e métrica;
- Playwright emula `prefers-reduced-motion: reduce` e confirma operação por
  teclado, navegação, foco e ausência de animação;
- axe continua cobrindo as superfícies centrais;
- validação integrada, Pages e clone limpo executam o novo gate.

## Falha encontrada e corrigida

O primeiro gate axe capturou contraste insuficiente durante o fade de conteúdo:
a opacidade intermediária misturava texto e fundo por alguns milissegundos. O
NexMotion agora anima apenas deslocamento ou escala em conteúdo essencial;
opacidade permanece restrita ao backdrop sem texto do diálogo.

A repetição E2E também encontrou uma disputa de foco durante a inicialização:
o roteador podia focar o título depois de a pessoa já ter alcançado o Skip
Link. O foco inicial agora só é movido enquanto o documento permanece neutro.

## Limites honestos

- A duração percebida pode variar conforme navegador, hardware e taxa de tela.
- NVDA e outros leitores de tela não foram reexecutados nesta fase.
- A suíte automatizada usa Chromium; outros motores permanecem para ciclos de
  compatibilidade e release.

## Migrações e ADR

Não há migração de dados. Nenhum ADR novo foi necessário porque motion e tabs
permanecem na camada de apresentação.

## Gate

Aprovado. Movimento reduzido elimina motion decorativo e nenhuma transição
impede ação, navegação ou mudança de foco na cobertura executada.

## Próxima fase

Fase 29: NexCopy.
