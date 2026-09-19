# NexStock — Blueprint Mestre Profissional v1.1

Versão do blueprint: 1.1  
Status: definitivo para início e continuidade do desenvolvimento  
Produto-alvo: NexStock 1.0  
Tipo: aplicação web responsiva, local-first, PWA, multilíngue e adaptável a nichos  
Hospedagem pública principal: GitHub Pages  
Frontend: HTML5, CSS3 e JavaScript moderno com ES Modules  
Persistência da demonstração: IndexedDB  
Persistência profissional opcional: PostgreSQL/Supabase  
Idiomas obrigatórios: pt-BR, en-US e es  
Meta de acessibilidade: WCAG 2.2 AA onde aplicável, com testes manuais usando NVDA

# 1. Autoridade deste documento

Este arquivo é a fonte de verdade do projeto NexStock.

Em caso de conflito entre documentação anterior e este blueprint, prevalece esta ordem:

1. `NEXSTOCK-BLUEPRINT-v1.1.md`.
2. Decisões explícitas posteriores registradas em CHANGELOG ou ADR.
3. Testes e critérios de aceite que implementam este blueprint.
4. README e documentação auxiliar.
5. Blueprint v1.0 e rascunhos anteriores.

O pacote visual `NexStock-Brand-Assets-v1.1.zip` é a fonte oficial dos ativos de marca.

Quando houver divergência entre `brand-assets.json` e este blueprint, prevalece este blueprint.

Nenhuma IA ou desenvolvedor deve reinterpretar silenciosamente decisões centrais.

Mudanças arquiteturais deverão ser registradas antes da implementação.

# 2. Alterações da v1.1

A versão 1.1 preserva a arquitetura conceitual da v1.0 e acrescenta decisões definitivas sobre identidade visual, assets, PWA, acessibilidade visual e integração da marca.

Principais mudanças:

- incorporação oficial das seis artes do NexStock;
- definição exata do local de uso de cada imagem;
- transparência real nas marcas que exigem fundo transparente;
- logo empilhada sem slogan embutido;
- slogan passa a ser texto HTML traduzível;
- definição dos ícones PWA e favicon derivados;
- regras específicas para temas claro e escuro;
- política de `alt`, imagens decorativas e leitores de tela;
- proibição de mascote ou hero dominando o dashboard analítico;
- criação de gate específico de identidade visual;
- aperfeiçoamento do modelo de lotes e validade;
- refinamento do DataProvider;
- refinamento das regras de integridade;
- fases reorganizadas para reduzir retrabalho.

# 3. Identidade do produto

## 3.1 Nome

NexStock

## 3.2 Slogan principal

pt-BR:

`Seu estoque, explicado de um jeito simples.`

en-US:

`Your inventory, explained simply.`

es:

`Tu inventario, explicado de forma sencilla.`

O slogan jamais deverá ser gravado diretamente em imagens usadas pela interface multilíngue.

## 3.3 Promessa complementar

pt-BR:

`Um estoque que se adapta ao seu negócio.`

en-US:

`Inventory that adapts to your business.`

es:

`Un inventario que se adapta a tu negocio.`

## 3.4 Conceito de experiência

Calm Intelligence.

O NexStock transforma complexidade em entendimento.

A sequência mental padrão da interface será:

`Situação → Explicação → Consequência → Ação.`

Exemplo:

`Restam 3 unidades.`

`Seu estoque mínimo é 5.`

`Por isso este produto entrou em nível crítico.`

`Registrar entrada.`

## 3.5 Personalidade

O produto deve parecer moderno, inteligente, acolhedor, confiável, organizado e tecnológico, sem parecer futurista demais.

Precisa ser simples para leigos sem parecer simplório.

Precisa parecer suficientemente refinado para ser apresentado como produto comercial.

# 4. Objetivo do projeto

O NexStock é uma ferramenta de controle e compreensão de estoque adaptável a diferentes nichos.

O projeto deverá demonstrar domínio de HTML semântico, CSS responsivo, JavaScript modular, modelagem de dados, persistência local, PostgreSQL, PWA, offline-first, segurança, internacionalização, acessibilidade, UX, testes, GitHub Actions e documentação técnica.

Ele não deverá parecer um CRUD acadêmico.

# 5. Não objetivos da versão 1.0

Ficam fora do escopo inicial:

- ERP completo;
- contabilidade;
- emissão fiscal;
- pagamentos;
- folha de pagamento;
- marketplace;
- checkout;
- gestão de vendas completa;
- colaboração em tempo real;
- permissões empresariais complexas;
- IA generativa obrigatória;
- machine learning obrigatório;
- aplicativo Android ou iOS nativo;
- integração bancária;
- dezenas de nichos pré-configurados.

Esses itens pertencem ao roadmap.

# 6. Público e modos de experiência

## 6.1 Usuário iniciante

Precisa compreender a ferramenta sem conhecer terminologia profissional de estoque.

O NexStock deverá explicar conceitos como estoque mínimo, movimentação, lote, serial e previsão.

## 6.2 Usuário experiente

Precisa de maior densidade de informação, atalhos e menos explicações.

## 6.3 Modo Guiado

Padrão para novos usuários.

Inclui textos auxiliares, exemplos, explicações de cálculos, dicas contextuais e confirmações relevantes.

## 6.4 Modo Compacto

Mantém as funcionalidades, mas reduz textos auxiliares e aumenta densidade.

A escolha deverá persistir no workspace.

# 7. Arquitetura conceitual

```text
NexStock
│
├── NexStock Core
├── NexProfiles
├── NexRules
├── NexPulse
├── NexInsights
├── NexShield
├── NexStock Anywhere
├── Stock Memory
├── Inventory Story
├── Time Machine
├── Scenario Lab
│
└── Módulos opcionais
    ├── NexExpiry
    ├── NexSerial
    ├── NexVariants
    ├── NexCompat
    ├── NexKit
    └── NexLifecycle
```

# 8. Estratégia tecnológica

## 8.1 Runtime

Usar HTML5, CSS3, JavaScript moderno e ES Modules.

Não usar React, Angular ou Vue na versão inicial.

Motivos:

- GitHub Pages simples;
- poucas dependências;
- código legível;
- menor superfície de ataque;
- demonstração clara dos fundamentos da Web.

## 8.2 Desenvolvimento

São permitidos para qualidade e testes:

- ESLint;
- Stylelint;
- html-validate;
- Vitest;
- Playwright;
- axe-core;
- fake-indexeddb.

Dependências de runtime deverão ser raras, justificadas e documentadas.

# 9. Convenções de código

Arquivos:

`kebab-case`

Funções e variáveis JavaScript:

`camelCase`

Classes JavaScript:

`PascalCase`

Constantes globais:

`UPPER_SNAKE_CASE`

Chaves de tradução:

`products.form.name.label`

Eventos internos:

`product:created`

IDs HTML serão reservados para semântica, relacionamentos, navegação e testes.

Custom properties CSS deverão utilizar prefixo:

`--ns-`

# 10. Estrutura oficial de diretórios

```text
nexstock/
│
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── NEXSTOCK-BLUEPRINT-v1.1.md
│
├── assets/
│   ├── brand/
│   │   ├── logos/
│   │   │   ├── nexstock-main-logo-16x9.png
│   │   │   └── nexstock-stacked-logo-4x3.png
│   │   ├── symbols/
│   │   │   ├── nexstock-brand-symbol-1x1.png
│   │   │   └── nexstock-app-icon-1x1.png
│   │   ├── mascot/
│   │   │   └── nexstock-mascot-full-body-3x4.png
│   │   └── scenes/
│   │       └── nexstock-brand-scene-16x9.jpg
│   └── icons/
│       └── pwa/
│           ├── icon-192x192.png
│           ├── icon-512x512.png
│           ├── icon-maskable-512x512.png
│           ├── favicon-32x32.png
│           └── favicon-48x48.png
│
├── css/
│   ├── tokens.css
│   ├── reset.css
│   ├── base.css
│   ├── accessibility.css
│   ├── components.css
│   ├── layout.css
│   ├── utilities.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── core/
│   │   ├── config.js
│   │   ├── router.js
│   │   ├── store.js
│   │   ├── events.js
│   │   └── version.js
│   ├── components/
│   ├── views/
│   ├── services/
│   │   ├── workspace-service.js
│   │   ├── product-service.js
│   │   ├── movement-service.js
│   │   ├── inventory-service.js
│   │   ├── insight-service.js
│   │   ├── scenario-service.js
│   │   ├── profile-service.js
│   │   ├── kit-service.js
│   │   ├── audit-service.js
│   │   └── security-service.js
│   ├── storage/
│   │   ├── data-provider.js
│   │   ├── indexeddb-provider.js
│   │   ├── supabase-provider.js
│   │   └── migrations/
│   ├── modules/
│   │   ├── expiry/
│   │   ├── serial/
│   │   ├── variants/
│   │   ├── compatibility/
│   │   ├── kits/
│   │   └── lifecycle/
│   ├── profiles/
│   ├── security/
│   ├── i18n/
│   └── utils/
│
├── locales/
│   ├── pt-BR.json
│   ├── en-US.json
│   └── es.json
│
├── demo/
│   ├── technology.json
│   ├── cosmetics.json
│   ├── fashion.json
│   └── food.json
│
├── database/
│   ├── schema.sql
│   ├── constraints.sql
│   ├── indexes.sql
│   ├── functions.sql
│   ├── policies.sql
│   └── seed.sql
│
├── docs/
│   ├── brand-assets.json
│   ├── architecture/
│   └── adr/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── e2e/
    ├── accessibility/
    └── fixtures/
```

# 11. Brand Asset System oficial

As seis imagens aprimoradas fazem parte formal da arquitetura.

## 11.1 Primary Horizontal Logo

Arquivo:

`assets/brand/logos/nexstock-main-logo-16x9.png`

Função:

logo horizontal oficial.

Usar em:

- cabeçalho da Welcome;
- About;
- README;
- apresentações;
- hero institucional em telas largas.

Não usar em:

- sidebar recolhida;
- favicon;
- cards pequenos;
- dashboard como decoração.

Se não houver nome adjacente:

`alt="NexStock"`

Se o nome já estiver presente em texto:

`alt=""`

## 11.2 Institutional Stacked Logo

Arquivo:

`assets/brand/logos/nexstock-stacked-logo-4x3.png`

Função:

logo empilhada institucional.

A imagem não contém slogan.

O slogan deverá aparecer abaixo em HTML e passar pelo sistema i18n.

Usar em:

- onboarding;
- About;
- apresentação;
- telas institucionais verticais.

Não usar como ícone.

## 11.3 Brand Symbol

Arquivo:

`assets/brand/symbols/nexstock-brand-symbol-1x1.png`

Função:

símbolo médio mostrando o esquilo organizando as nozes.

Usar em:

- onboarding;
- About;
- estados vazios selecionados;
- demonstrações conceituais;
- cards institucionais de baixa densidade.

Não repetir no dashboard.

## 11.4 Compact App Mark

Arquivo:

`assets/brand/symbols/nexstock-app-icon-1x1.png`

Função:

marca compacta.

Usar em:

- sidebar expandida com `NexStock` em texto;
- sidebar recolhida;
- loading curto;
- atualização PWA;
- base dos ícones instaláveis.

## 11.5 Mascot Illustration

Arquivo:

`assets/brand/mascot/nexstock-mascot-full-body-3x4.png`

Função:

mascote completa.

Usar em:

- onboarding;
- Demo Tour;
- estoque completamente vazio;
- instalação da PWA;
- About;
- telas especiais offline.

Não usar em:

- dashboard analítico;
- tabelas;
- diálogos frequentes;
- alertas críticos.

## 11.6 Brand Hero Illustration

Arquivo:

`assets/brand/scenes/nexstock-brand-scene-16x9.jpg`

Função:

hero institucional e material de apresentação.

Usar em:

- README;
- portfólio;
- About;
- Welcome pt-BR quando a linguagem da arte for coerente.

A imagem contém elementos textuais em português.

Portanto:

- não usar como hero em inglês ou espanhol enquanto o texto PT estiver visível;
- nesses idiomas usar Mascot ou Brand Symbol;
- nunca depender do texto gravado na imagem;
- versão futura poderá remover o texto ou possuir variantes localizadas.

## 11.7 PWA

Arquivos oficiais:

```text
assets/icons/pwa/icon-192x192.png
assets/icons/pwa/icon-512x512.png
assets/icons/pwa/icon-maskable-512x512.png
assets/icons/pwa/favicon-32x32.png
assets/icons/pwa/favicon-48x48.png
```

Fundo oficial:

`#0B1120`

Não realizar crop adicional em runtime.

# 12. Cores oficiais

## 12.1 Marca

```text
Brand Blue       #1D4ED8
Brand Navy       #0F172A
Brand Gray       #6B7280
Brand Light Gray #D1D5DB
Acorn Amber      #D99A32
Acorn Dark       #C98A2E
```

O âmbar é identidade visual.

Não deve substituir cores funcionais de warning.

## 12.2 Tema claro

```text
background     #F6F8FC
surface        #FFFFFF
surface-alt    #EEF2F7
text-primary   #0F172A
text-secondary #475569
border         #CBD5E1
primary        #1D4ED8
primary-hover  #1E40AF
accent         #0E7490
success        #15803D
warning        #A16207
danger         #B91C1C
```

## 12.3 Tema escuro

```text
background     #0B1120
surface        #111827
surface-alt    #1E293B
text-primary   #F8FAFC
text-secondary #CBD5E1
border         #334155
primary        #60A5FA
accent         #22D3EE
success        #4ADE80
warning        #FBBF24
danger         #F87171
```

# 13. Logos no modo escuro

Se o wordmark perder contraste, não aplicar:

`filter: invert()`.

Soluções válidas:

- superfície clara dedicada;
- App Mark + nome NexStock em HTML;
- futura variante dark oficial.

# 14. Proporção e margem

Nunca distorcer assets.

Manter `aspect-ratio`.

Preservar aproximadamente 8% de margem segura.

Não cortar cauda, cabeça ou noz.

Não aplicar sombras pesadas extras sobre as artes.

# 15. Acessibilidade das imagens

Nenhuma imagem será a única fonte de:

- status;
- quantidade;
- erro;
- ação;
- previsão;
- segurança;
- categoria.

Mascotes decorativas terão:

```html
alt=""
```

O NVDA não deverá receber descrições longas quando a informação já estiver em texto.

Definir `width` e `height`.

Hero acima da dobra pode usar:

```html
fetchpriority="high"
```

Imagens secundárias:

```html
loading="lazy"
```

# 16. Tipografia

Preferência:

Inter.

Fallback:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

A PWA deverá continuar funcional offline sem depender da fonte externa.

# 17. Componentes básicos

Criar:

- Button;
- IconButton;
- Input;
- Select;
- Checkbox;
- Radio;
- Textarea;
- Field;
- ErrorMessage;
- Card;
- MetricCard;
- StatusBadge;
- Table;
- EmptyState;
- Dialog;
- Toast;
- Alert;
- Tabs;
- SearchBox;
- CommandPalette;
- Breadcrumb;
- Skeleton;
- Tooltip;
- Progress;
- OfflineIndicator;
- BrandMark;
- BrandLogo;
- BrandIllustration.

Os componentes de marca centralizam dimensões, alt, temas e fallback.

# 18. Shell da aplicação

```text
Skip Link
App Shell
├── Sidebar
├── Header
├── Main
├── Live Regions
├── Dialog Layer
└── Toast Layer
```

Sidebar expandida:

App Mark + texto HTML `NexStock`.

Sidebar recolhida:

somente App Mark.

# 19. Rotas

```text
#/welcome
#/onboarding
#/dashboard
#/products
#/products/new
#/products/:id
#/products/:id/edit
#/movements
#/radar
#/insights
#/time-machine
#/scenario
#/kits
#/about
#/settings
#/settings/profiles
#/settings/security
#/shield-test
```

Após mudança:

1. atualizar `document.title`;
2. renderizar;
3. mover foco;
4. anunciar apenas quando necessário.

# 20. Local exato das imagens

## Welcome pt-BR

- Main Logo no cabeçalho.
- Brand Hero Scene no hero.
- slogan e CTA em HTML.

## Welcome en-US e es

- Main Logo.
- Mascot ou Brand Symbol no hero.
- slogan traduzido em HTML.
- não usar Brand Scene com texto português.

## Onboarding

Etapa 1:

Stacked Logo + slogan HTML.

Etapa 2:

Mascot.

Demais etapas:

Brand Symbol apenas quando útil.

## Dashboard

Nenhuma imagem grande.

Somente App Mark no shell.

## Produtos

Sem mascote na listagem.

Estado totalmente vazio:

Mascot ou Brand Symbol.

## Produto individual

Sem branding ilustrativo.

## Scenario Lab

Sem mascote grande.

Brand Symbol pequeno somente em estado vazio.

## Time Machine

Mesma regra do Scenario Lab.

## About

Stacked Logo + Brand Symbol.

Brand Scene opcional em pt-BR.

## Demo Tour

Mascot é o principal elemento visual.

## Instalação PWA

App Mark.

Mascot opcional.

## Offline

OfflineIndicator obrigatório.

Brand Symbol ou Mascot opcional.

## README

Ordem:

Main Logo → descrição → links → Brand Scene → recursos → arquitetura → acessibilidade → segurança → PWA → screenshots.

# 21. Internacionalização

Arquivos:

```text
locales/pt-BR.json
locales/en-US.json
locales/es.json
```

Uso:

```javascript
t("products.add")
```

Fallback:

idioma atual → pt-BR → chave em development.

Usar `Intl.NumberFormat`, `Intl.DateTimeFormat` e, quando útil, `Intl.RelativeTimeFormat`.

# 22. DataProvider

A UI nunca conversa diretamente com IndexedDB ou Supabase.

```text
DataProvider
├── IndexedDBProvider
└── SupabaseProvider
```

Serviços de domínio são intermediários.

# 23. Workspace

```text
id
name
profileKey
locale
currency
timezone
experienceMode
createdAt
updatedAt
```

IDs preferencialmente com:

```javascript
crypto.randomUUID()
```

# 24. Category

```text
id
workspaceId
name
code
description
createdAt
updatedAt
archivedAt
```

# 25. Supplier

```text
id
workspaceId
name
contactName
email
phone
notes
createdAt
updatedAt
archivedAt
```

Seeds não podem usar pessoas reais.

# 26. Product

```text
id
workspaceId
categoryId
supplierId
name
nexCode
description
trackingMode
currentQuantity
minimumStock
purchasePrice
salePrice
location
customData
createdAt
updatedAt
archivedAt
```

Tracking:

```text
bulk
batch
serialized
```

# 27. ProductUnit

```text
id
workspaceId
productId
serialNumber
condition
lifecycleState
warrantyStart
warrantyEnd
customData
createdAt
updatedAt
archivedAt
```

Lifecycle:

```text
in_stock
assigned
maintenance
retired
```

# 28. StockBatch

```text
id
workspaceId
productId
batchNumber
quantity
manufactureDate
expiryDate
createdAt
updatedAt
archivedAt
```

Lote deverá ser único por produto quando informado.

# 29. StockMovement

```text
id
workspaceId
productId
productUnitId
batchId
type
quantity
beforeQuantity
afterQuantity
reason
notes
createdAt
```

Tipos:

```text
IN
OUT
ADJUSTMENT
```

Quantidade é positiva.

O tipo determina a direção.

# 30. AuditLog

```text
id
workspaceId
entityType
entityId
action
beforeData
afterData
metadata
createdAt
```

Ações iniciais:

```text
PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_ARCHIVED
STOCK_IN
STOCK_OUT
STOCK_ADJUSTED
SERIAL_CREATED
BATCH_CREATED
PROFILE_CHANGED
```

# 31. ProductRelation

```text
id
workspaceId
sourceProductId
targetProductId
relationType
notes
createdAt
```

Tipos:

```text
compatible_with
requires
replaces
upgrade_of
accessory_for
```

# 32. Kit

```text
id
workspaceId
name
description
createdAt
updatedAt
archivedAt
```

# 33. KitItem

```text
id
kitId
productId
quantityRequired
```

# 34. CustomFieldDefinition

```text
id
workspaceId
profileKey
key
label
type
required
options
searchable
order
enabled
createdAt
updatedAt
```

Tipos:

```text
text
number
currency
date
boolean
select
multiselect
url
```

# 35. Datas e moeda

Datas internas em ISO 8601 UTC.

Exibição por `Intl`.

Moeda pertence ao workspace.

PostgreSQL deverá usar `numeric` ou estratégia equivalente para dinheiro.

# 36. IndexedDB

Nome:

`nexstock-db`

Stores:

```text
meta
workspaces
categories
suppliers
products
productUnits
batches
movements
auditLogs
productRelations
kits
kitItems
customFieldDefinitions
settings
syncQueue
```

Migrações:

`js/storage/migrations/`

Nunca apagar dados silenciosamente durante upgrade.

# 37. Demonstração pública

Fluxo:

1. visitante abre;
2. escolhe perfil;
3. seed é copiado;
4. workspace local é criado;
5. alterações ficam naquele navegador;
6. outros visitantes não são afetados;
7. reset restaura somente workspace atual.

Sem login obrigatório.

# 38. NexProfiles

Perfis:

```text
technology
cosmetics
fashion
food
custom
```

Perfil controla campos, módulos, regras, prefixos e seed.

# 39. Tecnologia

Ativa:

- NexSerial;
- NexCompat;
- NexKit;
- NexLifecycle.

# 40. Cosméticos

Ativa:

- NexExpiry;
- NexVariants.

# 41. Moda

Ativa:

- NexVariants.

# 42. Alimentos

Ativa:

- NexExpiry.

# 43. Personalizado

Usuário cria campos e escolhe módulos básicos sem editar código.

# 44. NexCode

Formato:

`PREFIX-CATEGORY-SEQUENCE`

Exemplos:

```text
NX-SSD-0042
COS-PER-0021
MOD-CAM-0102
```

Deverá ser único por workspace.

# 45. Status

Out:

```text
currentQuantity <= 0
```

Critical:

```text
currentQuantity > 0 &&
currentQuantity <= minimumStock
```

Attention:

```text
currentQuantity > minimumStock &&
currentQuantity <= attentionThreshold
```

Onde:

```text
attentionThreshold =
max(minimumStock + 1, ceil(minimumStock * 1.5))
```

Healthy:

acima do limite.

# 46. Integridade

Regra universal:

```text
currentQuantity >= 0
```

Saída inválida não cria movimentação.

# 47. Operação atômica

Movimentação:

1. lê;
2. valida;
3. calcula;
4. atualiza agregado;
5. atualiza lote/unidade;
6. grava movimento;
7. grava auditoria.

Ou tudo acontece ou nada acontece.

# 48. NexPulse

Responde:

`Como está meu estoque?`

Pesos iniciais:

```text
35% Availability
30% Minimum Compliance
15% Freshness
20% Forecast
```

Se Forecast não puder ser calculado, redistribuir pesos.

O texto tem prioridade sobre a pontuação.

# 49. Produto parado

Na versão inicial:

- estoque maior que zero;
- produto existe há pelo menos 30 dias;
- nenhuma saída nos últimos 30 dias.

# 50. Previsão

Janela:

30 dias.

```text
averageDailyOut = totalSaidas30Dias / 30
```

```text
daysRemaining =
currentQuantity / averageDailyOut
```

Arredondar somente na apresentação.

# 51. Confidence Meter

Baixa:

menos de 5 eventos.

Média:

5–14.

Alta:

15 ou mais eventos e pelo menos 14 dias úteis de histórico.

Nunca apresentar como certeza.

# 52. Explain the Math

Todo insight numérico importante terá:

`Como calculamos isso?`

Mostrar:

- dados usados;
- cálculo;
- resultado;
- limitações.

# 53. Stock Memory

Derivar:

- máximo histórico;
- mínimo histórico;
- última vez zerado;
- reposições;
- última entrada;
- última saída;
- maior saída;
- total movimentado;
- dias desde última movimentação.

# 54. Inventory Story

Determinístico.

Sem IA generativa obrigatória.

Templates em PT, EN e ES.

# 55. Time Machine

Passado:

reconstrução por movimentos.

Presente:

estado atual.

Futuro:

estimativa.

Informação futura sempre marcada como estimativa.

# 56. Scenario Lab

Cenários:

```text
saida
entrada
alterar_estoque_minimo
aumentar_ritmo_de_saida
```

Mostrar:

```text
Agora
Cenário
Impacto
Status resultante
```

Não persistir automaticamente.

# 57. Impact Preview

Mostrar antes da operação:

- quantidade atual;
- quantidade depois;
- status atual;
- status resultante.

Botão:

`Confirmar saída de 17 unidades`

Nunca usar simplesmente:

`Sim`.

# 58. NexSerial

Recursos:

- serial único;
- condição;
- garantia;
- lifecycle;
- histórico.

Duplicação bloqueia gravação.

# 59. NexExpiry

Baseado em StockBatch.

Estados:

- normal;
- próximo da validade;
- vencido.

Aviso inicial:

30 dias.

# 60. NexVariants

Suporta:

- cor;
- tamanho;
- tonalidade;
- volume.

Sem explosão automática de combinações.

# 61. NexKit

Quantidade de kits:

```text
min(
 estoqueDisponivel / quantidadeNecessaria
)
```

Parte inteira.

Missing Piece identifica o limitante.

# 62. NexCompat

Não inventar compatibilidade.

BuildGuard retorna:

```text
compatible
incompatible
unknown
```

Unknown é resultado legítimo.

# 63. Smart Substitute

Prioridade:

1. `replaces`;
2. substituição explícita;
3. atributos comparáveis.

Copy:

`Talvez você tenha uma alternativa.`

# 64. Busca

Pesquisar:

- nome;
- NexCode;
- categoria;
- fabricante;
- fornecedor;
- custom fields pesquisáveis.

Tolerar caixa e acentos.

# 65. Filtros

Inicialmente:

- categoria;
- status;
- fornecedor;
- arquivados;
- módulos relevantes.

Sempre permitir limpar.

# 66. Dashboard

Ordem:

1. saudação/contexto;
2. NexPulse;
3. prioridades;
4. métricas;
5. Inventory Story;
6. movimentações recentes;
7. insights.

Sem parede de gráficos.

# 67. Produtos

Colunas desktop:

- NexCode;
- nome;
- categoria;
- quantidade;
- mínimo;
- status;
- localização;
- ações.

# 68. Produto individual

Seções:

- Identidade;
- Estoque;
- Ações;
- Insight;
- Stock Memory;
- Movimentações;
- módulos.

# 69. Cadastro

Blocos:

1. informações principais;
2. estoque;
3. valores;
4. localização;
5. perfil;
6. revisão.

Botão:

`Gerar código`.

# 70. Estados vazios

Nunca usar apenas:

`Nenhum dado.`

Usar linguagem humana.

Mascote apenas nos estados definidos pelo Brand Asset System.

# 71. Command Palette

Atalho:

`Ctrl + K`

Ações:

- Novo produto;
- Buscar;
- Entrada;
- Saída;
- Críticos;
- Scenario Lab;
- Time Machine;
- idioma;
- tema.

Teclado completo.

Escape fecha.

Foco retorna.

# 72. Mobile

Navegação:

```text
Início
Produtos
Movimentar
Buscar
Mais
```

Pocket Mode prioriza ações rápidas.

# 73. Acessibilidade

Meta:

WCAG 2.2 AA.

## 73.1 Landmarks

Usar semanticamente:

`header`, `nav`, `main`, `section`, `footer`.

## 73.2 Skip Link

Primeiro foco:

`Pular para o conteúdo principal`

Destino:

```html
<main id="main-content" tabindex="-1">
```

## 73.3 Formulários

Todo campo:

- label;
- ajuda;
- erro associado;
- invalid state programático.

## 73.4 Resumo de erros

Ao tentar enviar:

1. mostrar resumo;
2. focar resumo;
3. fornecer links para campos;
4. preservar erro individual.

## 73.5 Live Regions

Usar `aria-live="polite"` com parcimônia.

`role="alert"` somente quando necessário.

## 73.6 Dialog

Preferir `<dialog>`.

Foco entra e retorna corretamente.

Escape fecha quando permitido.

## 73.7 Tabelas

Usar:

- caption;
- th;
- scope;
- headers claros.

## 73.8 Reduced motion

Respeitar:

`prefers-reduced-motion`.

## 73.9 Touch

Meta de 44 por 44 CSS pixels para controles importantes.

# 74. PWA

Manifest:

```text
name: NexStock
short_name: NexStock
start_url: ./
scope: ./
display: standalone
theme_color: #0B1120
background_color: #F6F8FC
```

# 75. Service Worker

Cache-first:

- shell;
- CSS;
- JS;
- traduções;
- icons;
- seeds;
- assets essenciais.

Cache:

`nexstock-shell-v<APP_VERSION>`

Atualização nunca apaga IndexedDB.

# 76. Offline

Mensagem:

`Você está offline. Pode continuar trabalhando com os dados disponíveis neste dispositivo.`

Deverão funcionar:

- dashboard;
- produtos;
- entrada;
- saída;
- ajustes;
- NexPulse;
- Time Machine;
- Scenario Lab;
- configurações locais.

# 77. Atualização PWA

Mensagem:

`Uma nova versão do NexStock está pronta.`

Botão:

`Atualizar agora`

Nunca atualizar durante operação crítica.

# 78. Sync Queue

Estrutura:

```text
id
operation
entityType
entityId
payload
createdAt
retryCount
status
```

Será preparada para futuro SupabaseProvider.

# 79. NexShield

Princípios:

- menor privilégio;
- nenhum segredo público;
- validação dupla;
- entrada não confiável;
- rastreabilidade;
- ações destrutivas reduzidas;
- prevenção de erros humanos.

# 80. XSS

Preferir:

```javascript
textContent
```

Proibido inserir entrada do usuário arbitrariamente em:

```javascript
innerHTML
```

Proibido:

```javascript
eval()
new Function()
```

# 81. URLs

Permitir apenas esquemas autorizados.

Bloquear:

`javascript:`

# 82. CSP

Restringir:

- default;
- scripts;
- estilos;
- imagens;
- fontes;
- conexões;
- objects;
- base URI;
- forms.

Evitar scripts inline.

# 83. Arquivamento

Ação padrão:

`Arquivar`.

Preservar histórico.

Exclusão física deverá ser excepcional.

# 84. Security Center

Rota:

`#/settings/security`

Mostrar fatos reais:

- provider;
- modo;
- banco;
- integridade;
- histórico;
- versão;
- conexão.

Sem “100% seguro”.

# 85. Shield Test Mode

Rota:

`#/shield-test`

Testar:

- estoque negativo;
- NexCode duplicado;
- serial duplicado;
- HTML;
- URL perigosa.

Usar dados isolados.

# 86. PostgreSQL/Supabase

Diretório:

`database/`

Usar:

- PK;
- FK;
- UNIQUE;
- CHECK;
- NOT NULL;
- indexes;
- RLS.

Exemplos:

```text
current_quantity >= 0
minimum_stock >= 0
unique(workspace_id, nex_code)
```

Nenhuma secret key no frontend.

# 87. Store

Estado global:

- workspace;
- locale;
- tema;
- experience mode;
- conexão;
- provider;
- PWA state;
- flags essenciais.

Evitar duplicar dados completos.

# 88. EventBus

Eventos:

```text
product:created
product:updated
product:archived
stock:changed
locale:changed
theme:changed
connection:online
connection:offline
profile:changed
app:updateAvailable
```

# 89. Seeds

Tecnologia:

- Orion Notebook;
- Quantum SSD;
- NovaMesh Router;
- Orbit Keyboard;
- Pulse Headset.

Demais nichos:

marcas fictícias.

# 90. Reset

Confirmar.

Limpar workspace.

Recarregar seed.

Reconstruir índices.

Navegar ao dashboard.

Anunciar sucesso.

# 91. Demo Tour

Máximo:

6 etapas.

Mostrar:

1. NexPulse;
2. Produtos;
3. Insight;
4. Scenario Lab;
5. Perfis;
6. NexShield/PWA.

Mascote será o ativo visual principal.

# 92. Performance

Priorizar:

- pouca dependência;
- lazy loading;
- imagens otimizadas;
- listas eficientes;
- ausência de layout shift;
- boa experiência em hardware comum.

WebP poderá ser derivado em fase de performance sem substituir PNG oficial.

# 93. Logging

Produção:

não registrar segredos nem dados desnecessários.

Development:

logs estruturados e configuráveis.

# 94. Testes unitários

Cobrir:

- NexCode;
- status;
- NexPulse;
- previsão;
- Confidence Meter;
- Stock Memory;
- kits;
- Missing Piece;
- Scenario;
- compatibilidade;
- estoque negativo;
- validade;
- serial.

# 95. Integração

Cobrir:

- produto;
- edição;
- arquivamento;
- movimentos;
- reset;
- IndexedDB;
- migração;
- profile;
- custom fields;
- batch;
- serial.

# 96. E2E

Fluxo principal:

Abrir → Tecnologia → criar → NexCode → entrada → saída → histórico → Scenario Lab.

Fluxo idiomas:

PT → EN → ES.

Fluxo offline:

online → persistir → offline → operar → fechar → reabrir → validar.

# 97. Teste de identidade visual

Verificar:

- seis arquivos;
- dimensões;
- alpha;
- hero 16:9;
- PWA icons;
- maskable;
- caminhos;
- stacked logo sem slogan;
- dashboard sem mascote dominante;
- dark mode;
- contraste.

# 98. Teste de acessibilidade

Automático:

axe-core.

Manual:

- NVDA;
- teclado;
- zoom 200%;
- dark mode;
- reduced motion;
- dialogs;
- forms;
- tables;
- command palette;
- routes;
- toast;
- PWA.

Gate:

zero violações críticas conhecidas nos fluxos principais.

# 99. CI

GitHub Actions executará:

1. JavaScript lint;
2. CSS lint;
3. HTML validation;
4. unit;
5. integration;
6. accessibility;
7. brand asset integrity;
8. PWA/static validation;
9. E2E configurado.

Deploy só após gates obrigatórios.

# 100. Commits

```text
feat:
fix:
refactor:
test:
docs:
a11y:
security:
brand:
perf:
chore:
```

# 101. Definition of Done

Uma funcionalidade só está pronta quando:

- funciona;
- trata erro;
- funciona com teclado;
- não possui blocker conhecido para NVDA;
- está em PT, EN e ES;
- claro/escuro funciona;
- não quebra offline quando aplicável;
- reset continua funcionando;
- respeita NexShield;
- possui testes;
- documentação necessária está atualizada.

# 102. Fase 0 — Governança

Entregas:

- Blueprint v1.1;
- README;
- CHANGELOG;
- CONTRIBUTING;
- LICENSE;
- backlog;
- marca v1.1 registrada.

Gate:

nenhuma decisão central depende apenas da conversa.

# 103. Fase 1 — Fundação técnica

Implementar:

- diretórios;
- index;
- app;
- modules;
- config;
- version;
- router;
- EventBus;
- Store;
- views vazias.

Gate:

rotas funcionam em subdiretório GitHub Pages sem reload obrigatório.

# 104. Fase 2 — Identidade visual

Implementar:

- seis assets;
- ícones;
- tokens;
- BrandMark;
- BrandLogo;
- BrandIllustration;
- alt;
- temas;
- fallback HTML.

Gate:

- todos carregam;
- não existe quadriculado falso;
- stacked não possui slogan;
- App Mark funciona na sidebar;
- contraste válido.

# 105. Fase 3 — Design System

Implementar shell, botões, fields, cards, tabela, dialogs, alertas, toasts, focus e empty states.

Gate:

nenhuma view futura reinventa componentes básicos.

# 106. Fase 4 — Internacionalização

Implementar PT, EN e ES.

Gate:

shell e Welcome completos nos três idiomas.

Brand Scene não aparece indevidamente em EN/ES.

# 107. Fase 5 — IndexedDB e DataProvider

Implementar persistência, migrations, services e seeds.

Gate:

dados sobrevivem a reload e reabertura.

# 108. Fase 6 — NexProfiles

Implementar cinco perfis.

Gate:

dois ou mais nichos usam o mesmo Core com campos diferentes.

# 109. Fase 7 — Core

Implementar CRUD, NexCode, busca, filtros e arquivamento.

Gate:

funciona em todos os profiles iniciais.

# 110. Fase 8 — Movimentações

Implementar transações, Audit Trail e Impact Preview.

Gate:

nenhum estado inconsistente.

# 111. Fase 9 — Dashboard

Implementar NexPulse, Radar e prioridades.

Gate:

situação pode ser entendida sem gráficos.

# 112. Fase 10 — Insights

Implementar previsões, Confidence Meter, Explain the Math e Stock Memory.

Gate:

todo insight numérico é reproduzível.

# 113. Fase 11 — Inventory Story

Implementar narrativa multilíngue.

Gate:

funciona inclusive sem movimentações.

# 114. Fase 12 — Scenario e Time Machine

Implementar simulações e passado/presente/futuro.

Gate:

nenhuma simulação persiste automaticamente.

# 115. Fase 13 — Custom Fields

Implementar criação dinâmica.

Gate:

usuário cria nicho simples sem tocar no código.

# 116. Fase 14 — Módulos

Ordem:

1. NexSerial;
2. NexExpiry;
3. NexVariants;
4. NexKit;
5. NexCompat;
6. NexLifecycle.

Gate:

desligar módulo não quebra Core.

# 117. Fase 15 — Busca e Command Palette

Implementar busca avançada e Ctrl+K.

Gate:

fluxos principais podem ser operados sem mouse.

# 118. Fase 16 — NexShield

Implementar hardening, Security Center e testes.

Gate:

todos os testes NexShield passam.

# 119. Fase 17 — PWA

Implementar manifest, service worker, cache, ícones, offline, update e drafts.

Gate:

fluxo central funciona offline após primeira visita.

# 120. Fase 18 — Responsividade

Testar:

- 320 px;
- 375 px;
- 768 px;
- desktop;
- zoom 200%.

Gate:

mobile não é desktop comprimido.

# 121. Fase 19 — Supabase/PostgreSQL

Implementar schema, RLS, policies e provider.

Gate:

provider pode ser alternado por configuração sem secrets públicos.

# 122. Fase 20 — Revisão de copy e i18n

Revisar integralmente os três idiomas.

Gate:

nenhuma chave ausente conhecida no fluxo principal.

# 123. Fase 21 — QA final

Executar todos os testes.

Nenhuma feature nova.

Gate:

zero bugs críticos e zero blockers NVDA conhecidos.

# 124. Fase 22 — GitHub Pages

Implementar CI/CD e deploy.

Gate:

clone limpo e deploy reproduzível.

PWA instala da URL pública.

# 125. Fase 23 — Portfólio

Finalizar README, Demo Tour, screenshots e documentação.

Gate:

visitante consegue entender o valor sem cadastrar dados manualmente.

# 126. Fase 24 — Release 1.0

Release somente quando:

1. GitHub Pages abre;
2. Welcome funciona;
3. branding oficial está integrado;
4. PT/EN/ES funcionam;
5. profile pode ser escolhido;
6. workspace é criado;
7. produto pode ser cadastrado;
8. NexCode funciona;
9. edição funciona;
10. arquivamento funciona;
11. entrada funciona;
12. saída funciona;
13. estoque negativo é bloqueado;
14. histórico funciona;
15. Audit Log existe;
16. NexPulse funciona;
17. Insights funcionam;
18. Explain the Math funciona;
19. Stock Memory funciona;
20. Inventory Story funciona;
21. Time Machine funciona;
22. Scenario Lab funciona;
23. Custom Fields funcionam;
24. pelo menos três módulos especializados estão prontos;
25. claro/escuro funciona;
26. teclado funciona;
27. NVDA funciona nos principais fluxos;
28. PWA instala;
29. offline funciona;
30. dados persistem;
31. reset funciona;
32. Shield Test passa;
33. CI passa;
34. README está completo;
35. identidade visual não quebra contraste, idioma nem performance.

Versão:

`v1.0.0`

# 127. Versionamento

Produto:

SemVer.

Blueprint e produto têm versões independentes.

Exemplo:

Blueprint:

`1.1`

Produto:

`1.0.0`

# 128. Protocolo obrigatório para qualquer IA

Antes de modificar código, determinar:

1. fase atual;
2. último gate concluído;
3. testes quebrados;
4. bugs conhecidos;
5. próxima entrega;
6. pertinência da tarefa;
7. impacto no GitHub Pages;
8. impacto no IndexedDB;
9. impacto em acessibilidade;
10. impacto em i18n;
11. impacto em NexShield;
12. impacto nos assets oficiais.

Ao terminar:

```text
Fase:
Objetivo do ciclo:
Alterações:
Arquivos modificados:
Testes executados:
Testes aprovados:
Bugs encontrados:
Pendências:
Gate da fase:
Próxima tarefa:
```

É proibido marcar uma fase como concluída sem passar pelo gate.

# 129. Novas ideias

Classificar antes:

```text
Core
Module
Brand
Roadmap
Rejected
```

Avaliar:

- utilidade;
- complexidade;
- offline;
- múltiplos nichos;
- acessibilidade;
- segurança;
- infraestrutura;
- identidade visual;
- impacto no escopo.

# 130. Roadmap pós-1.0

Possibilidades:

- QR/barcode scanner;
- câmera;
- push;
- sincronização real;
- autenticação;
- multiusuário;
- permissões;
- CSV;
- exportações;
- dashboards customizáveis;
- IA opcional;
- integrações;
- desktop packaging;
- novos profiles;
- Brand Scene sem texto;
- hero localizado;
- wordmark dark oficial.

Nenhum desses itens deverá atrasar a versão 1.0.

# 131. Definição final

O NexStock é uma plataforma local-first, adaptável e acessível que não apenas registra produtos.

Ela sabe:

- o que existe;
- o que mudou;
- por que algo importa;
- o que pode acontecer;
- como os produtos se relacionam;
- como diferentes nichos precisam ser tratados.

Ela permite compreender, simular, organizar e proteger o estoque.

A experiência deverá transmitir:

`Eu consigo entender meu estoque.`

A engenharia deverá transmitir:

`Este sistema foi projetado para crescer sem perder clareza.`

# 132. Princípio final obrigatório

Quando houver conflito entre adicionar mais funcionalidades e manter uma experiência simples, segura, acessível, estável e coerente com a identidade do NexStock, priorizar:

**simples, segura, acessível, estável e coerente.**

Essa regra é obrigatória durante todo o desenvolvimento.