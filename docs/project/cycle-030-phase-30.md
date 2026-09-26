# Ciclo 030 — Fase 30

## Protocolo de entrada

- Fase: 30, NexCopy contextual.
- Produto atual: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 29 aprovada, sem campo importante dependente de
  interpretação técnica implícita.
- Objetivo: implementar modos guiado e compacto, exemplos específicos por
  perfil, glossário e terminologia consistente em PT/EN/ES.
- Dependências: `experienceMode` e `profileKey` já persistidos no workspace,
  NexCopy base e catálogos equivalentes.
- Dados: sem novo store, schema ou migração.
- Acessibilidade: o compacto mantém ajuda essencial; o glossário usa semântica
  de definições, busca rotulada e status anunciado.
- Offline e GitHub Pages: serviço contextual e view do glossário entram no
  precache relativo.
- NexShield e NexMotion: sem alteração de contratos ou animações.

## Implementação

- `CopyService` normaliza modo e perfil com fallback seguro.
- Modo guiado exibe ajuda, exemplos e conteúdo complementar.
- Modo compacto mantém ajuda necessária e oculta exemplos adicionais, sem
  remover campos ou ações.
- Produtos e movimentações usam exemplos diferentes para Tecnologia,
  Cosméticos, Moda, Alimentos e Personalizado.
- Produtos, movimentações, cenários e campos personalizados exibem o modo ativo
  e oferecem acesso direto ao glossário.
- A rota `#/glossary` define nove termos centrais e permite busca por termo ou
  definição.
- Os 684 textos possuem estrutura equivalente em pt-BR, en-US e es.

## Evidências

- 130 testes unitários aprovados, incluindo resolução guiada, compacta,
  fallback e termos;
- 11 testes Playwright aprovados, cobrindo exemplos do perfil, redução
  compacta, glossário e troca de idioma;
- gate estático aprovado para cinco perfis, nove termos, rota, navegação e
  paridade de 684 mensagens por idioma;
- axe sem violações sérias ou críticas nas superfícies cobertas, incluindo o
  glossário;
- offline, movimento reduzido, build e validação do GitHub Pages aprovados;
- instalação, validação, E2E e build reproduzidos em clone temporário limpo.

## Bugs encontrados

O primeiro teste compacto expôs uma disputa de navegação no próprio teste: a
mudança para Produtos podia ocorrer antes da conclusão do redirecionamento do
onboarding para o Painel. O teste agora aguarda o título do Painel antes de
seguir, refletindo a sequência real do usuário. Nenhum defeito do produto foi
confirmado nesse caso.

## Migrações e ADR

Não há migração. Nenhum ADR novo foi necessário porque a camada contextual usa
dados já existentes e preserva a direção das dependências.

## Gate

Aprovado. Modos, exemplos, glossário e terminologia usam estruturas equivalentes
e comportamento consistente em pt-BR, en-US e es.

## Próxima fase

Fase 31: NexSettings.
