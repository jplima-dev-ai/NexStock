# NexProfiles e onboarding

## Núcleo compartilhado

Os cinco perfis usam `ProfileService`, `WorkspaceService`, DataProvider e o mesmo
modelo de produto. O registro em `js/profiles/profile-registry.js` altera apenas
prefixo, módulos e campos específicos:

- tecnologia: NexSerial, NexCompat, NexKit e NexLifecycle;
- cosméticos: NexExpiry e NexVariants;
- moda: NexVariants;
- alimentos: NexExpiry;
- personalizado: módulos básicos e campos escolhidos pelo usuário.

Definições são imutáveis. O serviço rejeita perfis, módulos e tipos de campo não
registrados. Campos personalizados são convertidos em chaves previsíveis e
armazenados como `customFieldDefinitions` vinculadas ao workspace.

## Onboarding

O fluxo possui quatro etapas:

1. apresentação com Stacked Logo e slogan em HTML;
2. escolha de perfil com mascote;
3. nome, modo de experiência e personalização;
4. revisão com Brand Symbol e confirmação.

Cada avanço valida somente a etapa atual. Mudanças de etapa movem o foco para o
título da nova etapa. Erros de campos usam `aria-invalid`, mensagens associadas
e foco no primeiro problema. A escolha é preservada ao trocar o idioma durante
o fluxo.

## Persistência

Workspace, seed, configurações de perfil e definições de campos são enviados ao
WorkspaceService e gravados em uma transação. A interface nunca acessa
IndexedDB. Se já existir workspace ativo, o onboarding não cria outro nem apaga
dados: oferece acesso ao painel.
