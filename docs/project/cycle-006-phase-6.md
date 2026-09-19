# Ciclo 006 — Fase 6

## Fase

Fase 6: NexProfiles.

## Objetivo

Permitir que negócios diferentes configurem o NexStock usando o mesmo núcleo,
com campos, módulos, prefixos e seeds adaptados ao nicho.

## Alterações

- Criado registro imutável para tecnologia, cosméticos, moda, alimentos e
  personalizado.
- Implementado ProfileService entre onboarding e WorkspaceService.
- Criado onboarding de quatro etapas nos três idiomas.
- Preservado o rascunho quando o idioma muda durante a configuração.
- Adicionados campos específicos e módulos por perfil.
- Implementada criação de campos e seleção de módulos no perfil personalizado.
- Adicionado seed vazio e seguro para o perfil personalizado.
- Configurações e campos passaram a sobreviver ao reset do workspace.
- Adicionadas validações de nome, perfil, modo, módulos e tipos de campo.

## Arquivos modificados

- `js/profiles/`, `js/services/profile-service.js` e serviços existentes.
- `js/views/onboarding-view.js`, modelo do onboarding e integração de rotas.
- `demo/custom.json`, catálogos, componentes de campo e estilos responsivos.
- Testes, validadores, documentação, README, changelog e backlog.

## Testes executados e aprovados

- `npm run validate`: cinquenta e um de cinquenta e um testes aprovados.
- Cinco perfis, assinaturas de módulos e campos validados.
- Tecnologia e moda comprovadas sobre o mesmo serviço com configurações
  diferentes.
- Perfil personalizado testado com módulos duplicados, tipos inválidos e chave
  normalizada.
- Quatro etapas, validação do rascunho e ordem de assets testadas.
- Cento e sessenta e duas mensagens equivalentes nos três idiomas.
- Persistência, migrações, marca, contraste, rotas e hospedagem continuam
  aprovados.

## Bugs encontrados

O texto de campo obrigatório estava fixo em português dentro do componente
Field. Ele passou a receber a tradução do catálogo, evitando mistura de idiomas
no onboarding.

O reset original recriava o seed, mas não carregava configurações e campos do
perfil. O serviço agora recupera esses dados antes da substituição e os grava no
novo workspace.

## Pendências

- A Fase 7 transformará os campos dos perfis em formulários completos de
  produto e implementará busca, filtros e arquivamento.
- A inspeção interativa em navegador, zoom de duzentos por cento e NVDA
  permanece não executada porque este ambiente não possui navegador executável.

## Gate

APROVADO. Os cinco nichos usam o mesmo Core e o mesmo fluxo de persistência;
tecnologia, cosméticos, moda e alimentos recebem módulos e campos distintos, e
o perfil personalizado cria definições controladas sem editar código.

## Próxima tarefa

Executar a Fase 7: Core de produtos com NexCode, cadastro, edição, busca,
filtros e arquivamento.
