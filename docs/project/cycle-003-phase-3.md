# Ciclo 003: Fase 3

Data: 18 de setembro de 2026.

## Fase

Fase 3: Design System.

## Objetivo do ciclo

Criar componentes básicos compartilhados, acessíveis e responsivos, eliminando
a necessidade de futuras views reinventarem controles fundamentais.

## Alterações

- Implementados Button, IconButton, Field, ErrorMessage, Checkbox, Radio, Card,
  MetricCard, StatusBadge, Table, Alert, Toast, Dialog e EmptyState.
- Criadas camadas globais de dialog e toast.
- Definidos IDs previsíveis para relacionamentos acessíveis.
- Adicionados estados de foco, hover, disabled, invalid e forced colors.
- Welcome passou a usar Button do Design System.
- Produtos passou a usar EmptyState oficial com Brand Symbol.
- Rotas comuns passaram a usar Card e rotas inválidas passaram a usar Alert.
- Criado validador de contratos e estilos do Design System.

## Arquivos modificados

- `index.html`, `package.json`, `CHANGELOG.md`, `README.md` e backlog.
- `css/tokens.css`, `css/components.css`, `css/layout.css` e
  `css/responsive.css`.
- Componentes em `js/components/` e utilitário de ID em `js/utils/`.
- `js/views/route-view.js` e `js/core/version.js`.
- Validador e testes unitários da biblioteca de componentes.

## Testes executados

- `npm run validate`.
- Verificação dos contratos exportados por cada módulo.
- Verificação da presença dos estilos e layers globais.
- Testes de variantes, IDs, relacionamentos de campo, feedback, status, tabela,
  foco de dialog, contraste, marca, rotas, Store, EventBus e hospedagem.
- Busca por componentes nativos recriados fora da camada compartilhada.
- Busca por `innerHTML`, `eval`, `new Function` e tabindex positivo.
- Verificação de sintaxe de todos os arquivos JavaScript.

## Testes aprovados

- Vinte e seis de vinte e seis testes automatizados aprovados.
- Todos os contratos essenciais do Design System foram encontrados.
- Nenhuma view cria botão, campo, tabela, dialog ou card diretamente.
- Nenhum padrão proibido foi encontrado no código da aplicação.
- Assets, contraste, rotas e carregamento em subdiretório continuam aprovados.

## Bugs encontrados

Um link visualmente desabilitado ainda manteria o `href` acionável por clique.
O componente passou a cancelar a navegação, remover o controle da ordem de foco
e expor `aria-disabled="true"`.

Alertas estáticos inicialmente receberam `role="status"`, o que poderia gerar
anúncios desnecessários ao renderizar uma rota. O papel automático foi removido;
`role="alert"` permanece reservado a mensagens realmente urgentes.

O fallback de foco do Dialog apontava para um título que não era focalizável.
O título agora recebe `tabindex="-1"`, permitindo foco programático seguro.

## Pendências

- Tabs, SearchBox, Command Palette, Tooltip, Progress e OfflineIndicator serão
  implementados nas fases funcionais correspondentes, evitando componentes sem
  uso real neste momento.
- Testes de interação em navegador, zoom de duzentos por cento e NVDA continuam
  não executados neste ambiente.

## Gate da Fase 3

APROVADO. Views existentes consomem os componentes compartilhados; contratos de
foco, erro, estado, tabela, feedback e empty state estão centralizados e
protegidos por validação automatizada.

## Próxima tarefa

Executar a Fase 4: internacionalização do shell e Welcome em pt-BR, en-US e es,
incluindo fallback e seleção correta dos assets por idioma.
