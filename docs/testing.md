# Testes e gates de qualidade

## Validação completa

```bash
npm run validate
```

O comando verifica estrutura estática, identidade visual, design system,
idiomas, persistência, perfis, produtos, movimentações, dashboard, insights,
narrativa, simulações, campos, módulos, busca, segurança, PWA, responsividade,
banco de dados, portfólio, todos os gates das Fases 25 a 78 — inclusive Audit
Explorer (Fase 59) e as Fases 60 a 73 —, testes unitários e E2E em Chromium
real. Esta é a cadeia canônica usada localmente, no clone limpo e no GitHub
Actions; a CI não mantém uma lista paralela de fases.

## Navegador real e acessibilidade automatizada

```bash
npm ci
npm run test:e2e
npm run test:e2e:smoke
```

A suíte Playwright usa um Chromium versionado pelo lockfile, sem depender de um
navegador já instalado na máquina. Ela cobre:

- smoke das rotas centrais e erros de runtime;
- onboarding, produto, NexCode, entrada, saída, histórico e Scenario Lab;
- persistência e reabertura do IndexedDB;
- isolamento entre simulação e estoque real;
- pt-BR, en-US e es;
- tema claro e escuro;
- skip link, foco, teclado e Paleta de Comandos;
- primeira visita, cache e reabertura offline;
- axe no navegador nas superfícies centrais.
- tokens e superfícies computados nos dois temas;
- iconografia vetorial, ordenação de tabelas e layout móvel em cards.
- movimento de rotas, abas, diálogo, sidebar, badges, números e feedback;
- operação completa com `prefers-reduced-motion: reduce`.
- ajuda, exemplos e associações acessíveis dos campos principais do NexCopy;
- ausência de dependência de placeholder ou tooltip nos fluxos cobertos.
- modos guiado e compacto, exemplos específicos por perfil e glossário;
- preservação da rota e terminologia ao trocar entre PT/EN/ES.
- links diretos, reload e navegação desktop e mobile das nove seções do
  NexSettings.
- resumo das configurações, atalhos, salvamento imediato, persistência após
  reload e confirmação de restauração.
- Import Center com CSV, mapeamento, erros por linha, correção, duplicatas,
  confirmação, auditoria e preservação do workspace em planos inválidos.
- Export Center com isolamento por workspace, filtros, campos permitidos,

- NexBackup com JSON versionado, validação de estrutura e referências,
  confirmação acessível e restauração transacional de dados e Product Media por
  workspace; uma falha de mídia não confirma um estado parcialmente aplicado.
  download CSV e JSON, proteção contra fórmulas e impressão da prévia.

O gate automatizado bloqueia violações axe de impacto sério ou crítico. Isso
não substitui testes manuais com NVDA ou outras tecnologias assistivas.

## GitHub Pages

```bash
npm run build:pages
npm run validate:pages
npm run verify:clean
```

O primeiro comando cria `_site`. O segundo valida o artefato e o workflow. O
terceiro instala pelo lockfile e reproduz validação, E2E e build a partir de um
clone temporário limpo.

## Verificação manual mínima

1. Abra Boas-vindas e acesse a Visita guiada sem criar dados.
2. Percorra as seis etapas por teclado e confirme títulos e exemplos.
3. Troque entre os três idiomas e confirme que a rota é preservada.
4. Crie um espaço de demonstração e confirme os cinco produtos no Painel.
5. Abra e feche a Paleta de Comandos com `Control + K` e `Escape`.
6. Ative o Shield Test Mode e confirme os cinco resultados.
7. Verifique o modo offline somente depois de uma carga online completa.
8. Importe um CSV inválido, confirme que nada foi gravado, corrija a linha e
   conclua a importação somente após revisar a confirmação.
9. Exporte produtos com um filtro, confira a prévia e confirme que CSV, JSON e
   impressão contêm somente os registros encontrados.
