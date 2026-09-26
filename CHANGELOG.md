# Changelog

## Unreleased — v1.5.0 Proactive Inventory

- Adiciona NexForecast 2 com suficiência de dados separada da confiança.
- Adiciona NexAnomaly determinístico para saídas incomumente grandes, com razão e movimentação-fonte explícitas.
- Adiciona NexReorder local: ponto de reposição baseado em consumo, lead time e estoque de segurança, sem compra automática.
- Adiciona NexActions: central de prioridades explicáveis e revisáveis, sem execução automática.
- Evolui o Dashboard 2.0 com NexActions entre NexPulse e métricas, em ordem linear e sem depender de gráficos.
- Adiciona Scenario Lab 2.0 para combinar múltiplas variáveis virtuais sem persistir alterações.
- Adiciona Scenario Comparison para contrastar estoque real e cenários A, B e C por quantidade, status, previsão, riscos e impacto.
- Evolui a Time Machine para reconstruir uma data com produtos, movimentações, métricas e NexPulse histórico reproduzível.
- Adiciona Inventory Digital Twin como cópia virtual imutável, isolada do estoque real e das gravações locais.
- Adiciona Consequence Preview 2.0 com antes/depois de quantidade, status, impacto e previsão antes de confirmar movimentações.
- Evolui o NexShield 2.0 com dez testes isolados de hardening para integridade, importação, restauração, isolamento entre espaços, corrupção e mídia.
- Adiciona NexHealth: diagnóstico local e não destrutivo para referências órfãs, duplicidades, estados impossíveis, lotes, mídia, relações, kits e movimentações inconsistentes.
- Adiciona Audit Explorer: timeline local, ordenada e textual do histórico de ações, sem alterar o AuditLog.
- Adiciona Reversal System: entrada ou saída pode gerar uma movimentação compensatória vinculada, sem editar ou apagar o registro original.
- Bloqueia reversão duplicada, ajustes manuais, movimentações de outro espaço e compensações que deixariam o estoque negativo.
- Adiciona confirmação textual acessível de reversão em pt-BR, en-US e es.

## 1.6.0 — 2026-09-26 — Decision Lab

- Formaliza as Fases 52 a 56: simulações múltiplas, comparação, histórico, Twin isolado e prévias de consequência.

## 1.4.0 — 2026-09-25 — Intelligence Foundation

- Adiciona sinais determinísticos de risco e inatividade, explicações reproduzíveis e linhagem de produto e movimentações-fonte.
- Evolui NexPulse: texto primeiro; pontuação somente com dimensões, dados disponíveis e limites explícitos.

## Unreleased — v1.3.0 Operational Speed

### Added

- Adiciona Mobile Operations 2.0: navegação inferior, ações rápidas em diálogo,
  entrada, saída, NexScan e busca em uma experiência própria para mobile.
- Adiciona NexLabels para gerar e imprimir etiquetas locais de produto, lote,
  localização e unidade serializada, com código reconhecido pelo NexScan.
- Adiciona NexScan: leitura opcional por câmera e `BarcodeDetector`, NexCode ou
  busca manual, com abertura do produto ou início de entrada e saída.
- Adiciona Product Media: upload local de JPEG, PNG e WebP, descrição
  alternativa, prévia, thumbnail e restauração por backup.
- Adiciona NexQuery local para transformar consultas de estoque suportadas em
  filtros explícitos, sem IA generativa ou dependência de rede.
- Evolui o Command Center 2.0: `Ctrl+K` agora reconhece entrada, saída,
  abertura e simulação direcionadas por produto, pré-preenchendo o fluxo que
  será executado com `Enter`.
- Mantém os comandos de produto controlados e locais em português, inglês e
  espanhol; consultas analíticas permanecem no NexQuery da próxima fase.

### Accessibility

- Confirma por Chromium que uma entrada e uma simulação podem começar somente
  com teclado, preservando foco, opções semânticas e anúncio de resultados.

## 1.2.0 — 2026-09-25 — Data Mobility

### Added

- Adiciona Import Center para CSV com seleção de arquivo, arrastar e soltar,
  detecção de delimitador, mapeamento de colunas e prévia editável.
- Valida campos e relações por linha, identifica duplicatas no arquivo e no
  workspace e só habilita a confirmação quando todo o plano é válido.
- Cria NexCodes sequenciais e auditoria `PRODUCT_IMPORTED` em uma única
  operação do provider após confirmação explícita.
- Adiciona rota profunda `#/settings/data/import`, suporte offline e textos
  equivalentes em português, inglês e espanhol.
- Adiciona Export Center para produtos, movimentações, lotes, auditoria e
  workspace, com prévia e filtros por texto, produto, datas e estados.
- Gera CSV com cabeçalhos localizados e proteção contra fórmulas, JSON com
  metadados reproduzíveis e impressão da prévia filtrada.
- Adiciona rota `#/settings/data/export` e mantém isolamento obrigatório por
  workspace, listas explícitas de campos e permissões do provider.
- Adiciona NexBackup para criar e restaurar cópias completas e versionadas do
  workspace, com revisão antes da confirmação.
- Adiciona snapshots locais para criar pontos de restauração manuais e
  automáticos antes de importação e restaurações.

### Accessibility

- Organiza o fluxo com títulos hierárquicos, fieldsets por linha, rótulos e
  mensagens de erro textuais, além de retorno de foco ao cancelar.
- Informa antes da confirmação: “Nenhuma alteração foi feita ainda.”
- O Export Center usa formulário e fieldset rotulados, tabela com caption,
  foco na prévia e região de status para download ou impressão.
- O NexBackup usa controles rotulados, resumo focável, avisos em texto e
  confirmação explícita antes de substituir dados.
- Snapshots oferecem listas semânticas, estados vazios textuais e confirmação
  independente para restaurar ou excluir cada ponto local.

### Technical

- Adiciona gate da Fase 33 e regressões unitárias e E2E que comprovam que uma
  importação inválida não altera nem corrompe o workspace.
- Adiciona gate da Fase 34 e regressões que verificam filtros, isolamento,
  campos permitidos, CSV seguro, JSON e impressão.
- Adiciona gate da Fase 35, validação de versão, tamanho, mídia, duplicidades e
  referências, além de restauração atômica por workspace no IndexedDB.
- Adiciona gate da Fase 36 e regressões para histórico de snapshots,
  restauração com cópia de segurança, limite explícito e cache offline.

## 1.1.0 — 2026-09-20 — Experience Foundation

### Added

- Registra a baseline reproduzível da versão 1.0.0 e a auditoria da Fase 25.
- Adiciona matriz de rastreabilidade entre funcionalidade, serviço, provider,
  teste e interface.
- Inclui os blueprints v1.1 e v1.2 no pacote governado.
- Adiciona Playwright com Chromium reproduzível, smoke suite, axe em navegador,
  fluxo principal E2E e testes reais de IndexedDB e offline.
- Adiciona NexDesign 2.0 com escala tipográfica, cinco níveis de superfície,
  espaçamento formal e catálogo vetorial de ícones.
- Adiciona NexMotion com tokens de duração e easing, transições curtas e abas
  acessíveis na leitura de previsão e memória do estoque.
- Adiciona NexCopy com ajuda e exemplos fictícios associados aos campos,
  categorias de estado vazio e contrato comum para carregamento.
- Adiciona NexCopy contextual com modos guiado e compacto, exemplos adaptados
  aos cinco perfis e glossário pesquisável.
- Adiciona NexSettings com shell, navegação interna, painel e nove rotas
  profundas para desktop e mobile.
- Adiciona Settings Summary com cinco áreas centrais, atalhos e estados reais.
- Adiciona salvamento imediato e validado para nome, moeda, fuso horário, tema
  e modo de experiência.

### Changed

- Atualiza backlog, visão de arquitetura, persistência, marca e guia de testes
  para refletirem o estado real após a versão 1.0.0.
- O gate integrado e o clone limpo passam a executar também a suíte E2E.
- Cards, estados e tabelas passam a compartilhar tokens semânticos; tabelas
  recebem ordenação, densidade, seleção, cabeçalho fixo e layout móvel em cards.
- Rotas, diálogos, navegação, badges, métricas e feedback recebem movimento
  discreto sem bloquear a operação.
- Ações, confirmações, erros e mensagens de sucesso passam a explicar efeitos e
  próximos passos; orientação essencial permanece fora de tooltips.
- Formulários passam a resolver a densidade de conteúdo pelo modo já salvo no
  workspace, sem preferência ou persistência paralela.
- Perfis, dados e segurança passam a compartilhar a estrutura do NexSettings;
  o reset seguro fica na seção Dados.
- Atualiza a versão estável para `1.1.0` após a aprovação das Fases 25 a 32.

### Accessibility

- Valida teclado, foco, Paleta de Comandos, temas, idiomas e axe nas superfícies
  centrais em Chromium.
- Corrige o link para pular conteúdo em conjunto com o roteador por hash.
- Ícones permanecem decorativos quando acompanhados por texto, e ordenação de
  tabelas expõe seu estado programaticamente.
- Movimento reduzido remove animações e transforms decorativos, preservando
  teclado, foco e conteúdo.
- Ajuda, exemplo e erro são associados ao campo em ordem previsível, sem usar
  placeholder como rótulo.
- O modo compacto mantém ajuda essencial; o glossário usa estrutura semântica,
  busca rotulada e anúncio de resultados.
- A seção atual do NexSettings usa `aria-current`; no mobile, um seletor
  rotulado substitui a navegação lateral sem perder o link direto.
- Estados de salvamento usam região de status; falhas restauram o valor anterior
  e alterações destrutivas continuam exigindo confirmação explícita.

### Technical

- Adiciona gate automatizado para os artefatos e documentos da Fase 25.
- Adiciona lockfile, instalação reproduzível no CI e gate da Fase 26.
- Mantém todos os módulos da aplicação no precache e valida a cobertura offline.
- Adiciona gate automatizado e teste em Chromium para o NexDesign 2.0.
- Adiciona gate automatizado em Chromium para NexMotion e movimento reduzido.
- Adiciona gate estático, testes unitários e fluxo Chromium para NexCopy.
- Adiciona gate de paridade contextual, testes dos dois modos, exemplos por
  perfil e terminologia do glossário em PT/EN/ES.
- Adiciona gate e testes em Chromium para as nove rotas do NexSettings,
  incluindo reload e navegação mobile.
- Adiciona testes de resumo, atalhos, persistência após reload e confirmação de
  alto impacto para concluir a Experience Foundation.

### Fixed

- Remove fades de conteúdo que reduziam temporariamente o contraste durante a
  entrada de rotas, cards, estados, números e feedback.
- Evita que o foco inicial da rota sobrescreva um controle já alcançado durante
  a inicialização da persistência.
- Corrige a falha da validação integrada causada pela ausência do blueprint
  v1.1 no pacote entregue.
- Evita que a primeira instalação do service worker recarregue a página e
  interrompa onboarding, atalhos ou formulários.

## 1.0.0 — Release estável

- Aprova os 35 critérios de release definidos no blueprint v1.1.
- Expõe o reset seguro do espaço de trabalho na rota Configurações.
- Adiciona confirmação acessível, bloqueio durante o reset e anúncio de resultado.
- Publica matriz de evidências, limites conhecidos e instruções de atualização.
- Preserva os dados do IndexedDB durante a atualização da aplicação.
- Revisa a copy nos três idiomas sem alterar a versão, corrigindo títulos de rota, traduções literais, terminologia e mensagens de recuperação.

## 0.23.0 — Fase 23

- Adiciona Demo Tour público, acessível e multilíngue em seis etapas.
- Permite compreender o valor do produto sem cadastrar dados manualmente.
- Finaliza o README profissional na ordem definida pelo blueprint.
- Adiciona screenshots reais e descrições textuais equivalentes.
- Publica guias de início, acessibilidade, segurança e testes.
- Adiciona gate automatizado específico para o portfólio.

## 0.22.1 — Correções pós-publicação

- Corrige termos não traduzidos na interface em português.
- Remove notificações no idioma anterior ao trocar a localização ativa.
- Localiza os fatos de integridade e auditoria exibidos na Central de Segurança.
- Distingue corretamente as garantias de integridade do IndexedDB e do PostgreSQL.
- Adiciona regressões automatizadas para as correções encontradas na página publicada.

## 0.22.0 — Fase 22

- Adiciona CI/CD oficial para validação e publicação no GitHub Pages.
- Gera um artefato `_site` mínimo, sem fontes de teste, banco ou documentação interna.
- Valida caminhos relativos, manifest, ícones, cache offline e registro do service worker.
- Adiciona verificação automatizada dos contratos e permissões do workflow.
- Reproduz validação e build em um clone temporário limpo.
- Mantém a publicação externa pendente até a conexão com um repositório GitHub.

## 0.21.0 — Fase 21

- Executa o gate final de QA sem adicionar funcionalidades.
- Corrige o acúmulo de eventos da Paleta de Comandos após trocas de idioma.
- Sincroniza `aria-expanded` da busca global com a abertura e o fechamento do diálogo.
- Adiciona regressão automatizada para o ciclo de destruição e reinicialização da paleta.
- Valida versão, imports locais, recursos do cache, referências HTML, manifest e ausência de testes desativados.
- Registra matriz de evidências, riscos residuais e decisão do gate.

## 0.20.0 — Fase 20

- Revisa integralmente a copy dos fluxos principais em português, inglês e espanhol.
- Remove mensagens provisórias de desenvolvimento e referências internas ao blueprint.
- Corrige frases com contadores para funcionar no singular e no plural sem ambiguidade.
- Padroniza termos de interface, segurança e configuração nos três idiomas.
- Valida automaticamente paridade de parâmetros, chaves usadas no código, traduções de rotas e grupos críticos.

## 0.19.0 — Fase 19

- Adiciona schema PostgreSQL completo, constraints, índices, funções e policies RLS.
- Implementa `SupabaseProvider` intercambiável com IndexedDB por configuração.
- Adiciona RPC transacional de movimentação, isolamento por workspace e papéis de acesso.
- Bloqueia conexões HTTP e chaves administrativas no frontend.

## 0.18.0 — Fase 18

- Adiciona navegação móvel recolhível e acessível.
- Implementa reflow específico para formulários, cabeçalho, ações, dados e diálogos.
- Reforça alvos de toque, textos longos, tabelas locais e compatibilidade com zoom de duzentos por cento.
- Adiciona matriz automatizada para 320, 375, 768, desktop e zoom.

## 0.17.0 — Fase 17

- Adiciona manifest instalável, service worker e cache offline versionado.
- Implementa indicador offline, atualização controlada e proteção de operações críticas.
- Preserva rascunhos locais de produtos e movimentações por workspace.
- Mantém o IndexedDB intacto durante atualizações da aplicação.

Todas as mudanças relevantes do NexStock serão registradas neste arquivo.

## Histórico acumulado anterior à v1.0.0

### Added

- Governança inicial, documentação de contribuição e registro de backlog.
- Fundação em HTML, CSS e JavaScript com ES Modules.
- Roteamento por hash compatível com subdiretórios do GitHub Pages.
- EventBus, Store mínimo e registro central de rotas.
- Shell semântico com Skip Link e gerenciamento de foco entre rotas.
- Testes unitários e validação estática inicial.
- Pacote oficial de marca v1.2 preservado com verificação de integridade.
- Componentes centralizados para logos, App Mark, símbolo, mascote e hero.
- Welcome institucional com slogan em HTML e hero oficial em português.
- Identidade específica para Onboarding e Sobre, sem branding dominante nas
  rotas analíticas.
- Temas claro e escuro com controle operável por teclado e estado acessível.
- Validação automatizada de dimensões, transparência, fundo dos ícones PWA e
  contraste dos pares de cores essenciais.
- Design System compartilhado para botões, campos, escolhas, mensagens de erro,
  cards, métricas, badges de status, tabelas, alertas, toasts, dialogs e estados
  vazios.
- Camadas globais para diálogos e notificações.
- Empty State de Produtos usando Brand Symbol somente no contexto autorizado.
- Validação automatizada dos contratos públicos e estilos essenciais dos
  componentes.
- Catálogos equivalentes para pt-BR, en-US e es, com fallback previsível para
  pt-BR e interpolação segura de parâmetros.
- Seletor de idioma acessível com troca sem recarregar a página ou perder a
  rota atual.
- Regra visual que restringe a Brand Scene com texto gravado ao locale pt-BR.
- Validação automatizada das chaves, mensagens, slogans oficiais e assets de
  Welcome permitidos por idioma.
- Contrato DataProvider e implementação IndexedDBProvider para o banco local
  `nexstock-db`.
- Migração inicial aditiva com os quinze stores definidos no blueprint e
  índices por workspace.
- WorkspaceService e ProductService separados da tecnologia de armazenamento.
- Gravação atômica de workspaces de demonstração e reset isolado por workspace.
- Seeds fictícios para tecnologia, cosméticos, moda e alimentos.
- Recuperação não destrutiva para IndexedDB indisponível, bloqueado ou atualizado
  por outra aba, com mensagens nos três idiomas.
- Testes de contrato, migração, seeds, reabertura, reset e ponteiro órfão.
- Registro imutável dos cinco NexProfiles com módulos, prefixos e campos
  específicos por nicho.
- Onboarding acessível em quatro etapas, preservado durante troca de idioma.
- Criação de workspace integrada aos seeds e à persistência local.
- Perfil personalizado com seleção controlada de módulos e criação de campos
  sem edição de código.
- Restauração das configurações e campos específicos durante reset do workspace.
- Cento e sessenta e duas mensagens equivalentes em pt-BR, en-US e es.
- Core compartilhado de produtos com cadastro, edição, detalhes e arquivamento
  lógico.
- NexCode sequencial com índice composto único por workspace.
- Busca tolerante a caixa e acentos em nome, código, relações e campos
  personalizados pesquisáveis.
- Filtros de categoria, status e arquivamento com ação única para limpar.
- Status de estoque derivados pela fórmula oficial do blueprint.
- AuditLog atômico para criação, edição e arquivamento de produtos.
- Formulários adaptados aos campos definidos pelo NexProfile ativo.
- Movimentações de entrada, saída e ajuste com prévia de quantidade e status.
- Confirmações explícitas e histórico no workspace e nos detalhes do produto.
- Transação única para atualização do produto, StockMovement e AuditLog.
- Bloqueio de estoque negativo e rejeição de prévias desatualizadas.
- Dashboard textual com NexPulse, Radar e prioridades ordenadas por urgência.
- Métricas essenciais e movimentações recentes sem dependência de gráficos.
- Detecção determinística de produto parado após 30 dias sem saída.
- Redistribuição explícita do peso de Forecast enquanto a previsão não está
  disponível.
- Previsão de cobertura baseada nas saídas dos últimos 30 dias.
- Confidence Meter com níveis baixo, médio e alto.
- Explain the Math com dados, fórmulas, resultados e limitações acessíveis.
- Stock Memory com extremos históricos, reposições e resumo de movimentações.
- Integração transparente de Forecast ao NexPulse quando há dados calculáveis.
- Inventory Story determinística, multilíngue e funcional mesmo sem movimentações.
- Scenario Lab com quatro simulações em memória e nenhuma persistência automática.
- Time Machine com passado reconstruído, presente real e futuro marcado como estimativa.
- Custom Fields dinâmicos com oito tipos, opções, busca, auditoria e desativação não destrutiva.
- Módulos especializados para serial, validade, variações, kits, compatibilidade, substitutos e lifecycle.
- Busca avançada com fornecedor e módulo relevante, além da Command Palette acessível por Ctrl+K.
- NexShield com hardening, Central de Segurança factual e Shield Test Mode isolado.

### Changed

- A referência operacional de assets passa do nome v1.1 citado no blueprint ao
  pacote v1.2 fornecido, conforme ADR 0001.
