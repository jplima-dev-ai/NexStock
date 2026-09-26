# Ciclo 026 — Fase 26

## Protocolo de entrada

- Fase: 26, Testing Foundation 2.0.
- Produto atual: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 25 aprovada e baseline reproduzível.
- Objetivo: executar o fluxo principal em navegador real e proteger IndexedDB,
  idiomas, temas, teclado, acessibilidade automatizada e offline.
- Dependências: Playwright, Chromium e axe-core travados no lockfile.
- Dados: sem migração; testes usam contextos isolados e bancos descartáveis.
- i18n: pt-BR, en-US e es exercitados no navegador.
- Acessibilidade: teclado, foco, skip link, dialog e axe em Chromium.
- Offline e GitHub Pages: service worker real em servidor local com caminho de
  subdiretório equivalente ao Pages.
- NexShield, NexCopy e NexMotion: sem mudança de contrato; smoke e regressão
  preservam o comportamento atual.

## Implementação

- Configuração Playwright com Chromium reproduzível e execução serial.
- Smoke suite para dez rotas centrais e captura de erros de página e console.
- Fluxo E2E: onboarding, produto, NexCode, entrada, saída, histórico,
  persistência, Scenario Lab e reabertura.
- Verificação direta dos stores e registros do IndexedDB no navegador.
- Testes de idiomas, temas, atalhos, foco e Paleta de Comandos.
- Teste de instalação, controle e reabertura offline pelo service worker.
- Precache explícito de todos os módulos da aplicação, protegido pelo gate PWA.
- Axe com regras WCAG 2 A, AA, 2.1 AA e 2.2 AA nas superfícies centrais.
- CI e clone limpo com `npm ci` antes do gate completo.

## Falhas encontradas e corrigidas

1. O link para pular conteúdo usava `#main-content`, que podia ser interpretado
   pelo roteador como rota. A ativação agora mantém a URL e move o foco ao main.
2. O service worker recarregava a página no primeiro `controllerchange`, mesmo
   sem atualização solicitada. A página agora recarrega apenas depois de o
   usuário escolher aplicar uma atualização.

As duas causas receberam regressão E2E; o ciclo do service worker também recebeu
regressão unitária.

## Evidências

- testes unitários: 121 aprovados;
- Playwright E2E: 5 aprovados em Chromium real;
- axe: zero violações sérias ou críticas nas superfícies cobertas;
- fluxo principal com IndexedDB: aprovado;
- pt-BR, en-US, es, temas e teclado: aprovados;
- offline após primeira visita: aprovado;
- build, artefato Pages e clone limpo: aprovados.

## Limites honestos

- NVDA, JAWS, Narrator, VoiceOver, TalkBack e Orca não foram executados neste
  ambiente.
- A suíte desta fase usa Chromium; matriz com outros motores poderá ser ampliada
  em ciclos de compatibilidade e release.
- Axe não substitui avaliação manual de compreensão e autonomia.

## Migrações e ADR

Não há migração de dados. Nenhum ADR novo foi necessário porque a arquitetura
de produção permaneceu igual; as mudanças funcionais corrigem foco e ciclo de
atualização já definidos nos blueprints.

## Gate

Aprovado. O fluxo principal foi executado em navegador real e não há regressão
crítica conhecida na cobertura da Fase 26.

## Próxima fase

Fase 27: NexDesign 2.0.
