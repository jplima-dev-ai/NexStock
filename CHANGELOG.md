# Changelog

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

## Unreleased

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
