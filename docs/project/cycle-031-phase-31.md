# Ciclo 031 — Fase 31

## Protocolo de entrada

- Fase: 31, NexSettings.
- Produto atual: `1.0.0`.
- Release alvo: `1.1.0 — Experience Foundation`.
- Gate anterior: Fase 30 aprovada com copy contextual equivalente em PT/EN/ES.
- Objetivo: implementar `SettingsShell`, `SettingsNav`, `SettingsPanel`, rotas
  profundas e comportamentos próprios para desktop e mobile.
- Dados: sem novo store, schema ou migração.
- Acessibilidade: um título principal por rota, seção atual programática,
  navegação nomeada e seletor mobile rotulado.
- Offline e GitHub Pages: módulos existentes permanecem no precache e o cache
  recebe uma nova identidade de fase.

## Implementação

- `SettingsShell` organiza o cabeçalho, a escolha mobile e o layout interno.
- `SettingsNav` expõe nove links e informa a página atual com `aria-current`.
- `SettingsPanel` apresenta Resumo, Geral, Aparência, Estoque, Perfis, Dados,
  Segurança, PWA e Avançado.
- Perfis e Segurança preservam as funcionalidades existentes dentro do novo
  shell; a restauração protegida do workspace passa para Dados.
- Desktop usa navegação lateral interna; mobile usa um seletor com rótulo.
- Cada seção possui hash próprio e deriva inteiramente da rota, portanto o
  reload preserva a seção sem criar persistência paralela.
- Os três catálogos mantêm estrutura e terminologia equivalentes.

## Evidências

- 132 testes unitários aprovados, incluindo as nove seções e fallback seguro;
- 13 testes Playwright aprovados, incluindo links diretos, reload e seletor
  mobile;
- axe sem violações sérias ou críticas nas superfícies cobertas, incluindo
  Resumo, Aparência e Segurança;
- offline, teclado, foco, temas, movimento reduzido, build e validação do
  GitHub Pages aprovados;
- instalação, validação, E2E e build reproduzidos em clone temporário limpo.

## Bugs encontrados

Nenhum defeito de produto foi confirmado durante a implementação desta fase.

## Migrações e ADR

Não há migração. Nenhum ADR novo foi necessário: o NexSettings compõe views e
serviços existentes, preservando a direção atual das dependências.

## Gate

Aprovado. Todas as nove seções aceitam link direto, e o reload mantém a seção
ativa em desktop e mobile.

## Próxima fase

Fase 32: Settings Summary.
