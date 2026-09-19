# NexStock

![Logo principal do NexStock, com um esquilo ao lado do nome da aplicação](assets/brand/logos/nexstock-main-logo-16x9.png)

NexStock é uma PWA local-first que transforma registros de estoque em uma
leitura compreensível: situação atual, prioridades, histórico, estimativas
explicáveis e simulações que não alteram os dados reais.

Versão estável: `1.0.0`. Fases 0 a 24 do blueprint concluídas.

## Links

- [Aplicação publicada](https://jplima-dev-ai.github.io/NexStock/)
- [Visita guiada em seis etapas](https://jplima-dev-ai.github.io/NexStock/#/tour)
- [Guia de início](docs/getting-started.md)
- [Arquitetura](docs/architecture/overview.md)
- [Implantação no GitHub Pages](docs/deployment/github-pages.md)
- [Blueprint mestre](NEXSTOCK-BLUEPRINT-v1.1.md)

![Cena institucional do NexStock com a mascote organizando unidades de estoque](assets/brand/scenes/nexstock-brand-scene-16x9.jpg)

## Recursos principais

- NexPulse com resumo textual, pontuação de apoio e prioridades ordenadas.
- Cadastro, busca, filtros, NexCode sequencial e arquivamento lógico.
- Entradas, saídas e ajustes com prévia, auditoria e proteção contra estoque negativo.
- Insights com cobertura estimada, confiança, memória e cálculo reproduzível.
- Scenario Lab e Time Machine sem mutação dos dados durante a simulação.
- Perfis para tecnologia, cosméticos, moda, alimentos e operações personalizadas.
- Módulos de serial, validade, variações, kits, compatibilidade e substitutos.
- Interface em Português do Brasil, inglês dos Estados Unidos e espanhol.

## Arquitetura

O frontend usa HTML, CSS e JavaScript com módulos ES, sem framework. A interface
consome serviços de domínio, que dependem do contrato `DataProvider`. O provider
padrão persiste no IndexedDB; uma configuração validada pode selecionar
PostgreSQL/Supabase.

Fluxo principal: `interface → serviços de domínio → DataProvider → banco`.

Consulte a [visão de arquitetura](docs/architecture/overview.md), a
[persistência](docs/architecture/persistence.md) e a
[integração Supabase](docs/architecture/supabase.md).

## Acessibilidade

A meta é WCAG 2.2 AA onde aplicável. O produto possui HTML semântico, link para
pular conteúdo, foco visível, gerenciamento de foco entre rotas, operação por
teclado, textos além de cor e layout responsivo até zoom de duzentos por cento.
O fluxo principal recebeu teste exploratório positivo com NVDA no Windows.

Consulte a [declaração de acessibilidade](docs/accessibility.md).

## Segurança

NexShield aplica validações de domínio, URLs permitidas, inserção segura de
texto, constraints locais ou PostgreSQL, isolamento por espaço de trabalho e
auditoria. A Central de Segurança relata apenas controles verificáveis e oferece
cinco testes adversariais isolados.

Consulte o [modelo de segurança](docs/security.md).

## PWA e funcionamento offline

O manifest permite instalação, e o service worker mantém um cache versionado do
shell. O estado da conexão é anunciado, atualizações são aplicadas por ação
explícita e rascunhos ficam no dispositivo. A atualização da aplicação não
apaga o IndexedDB.

## Screenshots

### Boas-vindas

![Tela de boas-vindas com navegação lateral, identidade NexStock, chamada principal e ilustração institucional](assets/screenshots/welcome.jpg)

### Painel com dados de demonstração

![Painel do NexStock com NexPulse, prioridades, cinco produtos, setenta e seis unidades e narrativa textual do estoque](assets/screenshots/dashboard-demo.jpg)

As imagens complementam a documentação. Todos os fluxos importantes permanecem
descritos em texto e operáveis sem depender delas.

## Executar localmente

Pré-requisito: Node.js 20 ou superior.

```bash
npm start
```

Abra `http://localhost:4173/nexstock/#/welcome` ou o endereço informado pelo
servidor.

## Validar e gerar o site

```bash
npm run validate
npm run build:pages
npm run validate:pages
```

Consulte o [guia de testes](docs/testing.md) para entender cada gate.

## Contribuição e licença

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar mudanças. Todos os
direitos estão reservados até que o titular escolha uma licença pública
explícita.
