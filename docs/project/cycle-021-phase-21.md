# Ciclo 021 — Fase 21

## Objetivo

Executar o QA final do NexStock sem acrescentar funcionalidades, procurando falhas críticas, regressões e bloqueios de acessibilidade conhecidos.

## Achado corrigido

A reinicialização da Paleta de Comandos durante a troca de idioma removia o diálogo anterior, mas não o evento associado ao botão de abertura. Trocas repetidas acumulavam eventos e podiam chamar instâncias desconectadas do documento.

A correção agora remove explicitamente o evento antigo, mantém `aria-expanded` coerente com o diálogo e possui teste de regressão dedicado.

## Gates executados

- validações estáticas e de segurança;
- identidade visual e Design System;
- equivalência de 563 mensagens em três idiomas;
- persistência local e PostgreSQL/Supabase;
- produtos, movimentações, dashboard, insights e módulos;
- PWA, cache, rascunhos e atualização controlada;
- responsividade, zoom e reflow;
- testes unitários e de integração;
- servidor estático em subdiretório;
- resolução de imports locais;
- integridade dos recursos do service worker e do manifest;
- unicidade de identificadores e referências do HTML;
- ausência de testes marcados como `skip` ou `only`.

## Matriz de evidências de acessibilidade

| Ambiente | Verificação | Resultado | Evidência e limite |
| --- | --- | --- | --- |
| Node.js | Contratos de semântica, foco, teclado, contraste e reflow | Aprovado | Suíte automatizada; não substitui leitor de tela real. |
| Servidor HTTP local | Shell, módulos, assets, catálogos e subdiretório | Aprovado | Teste de integração executado automaticamente. |
| Windows, navegador e NVDA | Fluxos funcionais da versão anterior à revisão final | Aprovado pelo usuário | Teste manual informado pelo usuário; não foi executado pelo agente. |
| Windows, navegador e NVDA | Alterações específicas das Fases 20 e 21 | Não testado pelo agente | Recomendado reteste manual da troca de idioma e da Paleta de Comandos. |
| JAWS, Narrator, VoiceOver, TalkBack e Orca | Fluxos críticos | Não testado | Nenhuma dessas tecnologias está disponível neste ambiente. |

## Riscos residuais

- automação não demonstra compatibilidade universal com tecnologias assistivas;
- a integração opcional com Supabase requer um projeto real para teste remoto completo;
- instalação pela URL pública será validada na Fase 22, após o deploy.

## Gate

Nenhum bug crítico foi encontrado e nenhum bloqueio de NVDA é conhecido. O gate da Fase 21 está aprovado com as limitações de ambiente registradas acima. Isso não equivale a afirmar ausência total de bugs.
