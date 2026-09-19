# NexStock

NexStock é uma aplicação web de controle e compreensão de estoque. O produto é
local-first, responsivo, acessível, multilíngue e preparado para funcionar como
PWA em hospedagem estática.

Status atual: Fases 0 a 10 aprovadas; versão de desenvolvimento 0.10.0. A versão
1.0.0 ainda não foi liberada.

## Fonte de verdade

As decisões do produto estão em
[`NEXSTOCK-BLUEPRINT-v1.1.md`](NEXSTOCK-BLUEPRINT-v1.1.md). Mudanças posteriores
devem ser registradas em ADR e no changelog.

## Executar localmente

Pré-requisito: Node.js 20 ou superior.

```bash
npm start
```

Abra `http://localhost:4173/nexstock/#/welcome` ou o endereço informado pelo
servidor.

## Validar

```bash
npm run validate
```

O comando verifica os arquivos essenciais, as rotas base, práticas de segurança
estática, a equivalência dos catálogos de idioma e os testes automatizados
disponíveis.

## Persistência local

O banco `nexstock-db` usa IndexedDB e é acessado somente pelo
`IndexedDBProvider`. Serviços de domínio consomem o contrato `DataProvider`,
mantendo a interface independente da tecnologia de armazenamento. Migrações são
aditivas e não apagam dados silenciosamente.

Os seeds fictícios de tecnologia, cosméticos, moda, alimentos e personalizado
ficam em `demo/`. O onboarding permite escolher qualquer um desses perfis.
Todos usam o mesmo núcleo com módulos e campos adaptados ao nicho.

## Produtos

O Core compartilhado permite cadastrar, editar, consultar, buscar, filtrar e
arquivar produtos. NexCode é gerado no formato prefixo, categoria e sequência,
com unicidade garantida por workspace. Arquivamento é lógico e preserva dados e
auditoria.

## Movimentações

Entradas, saídas e ajustes exibem uma prévia de quantidade e status antes da
confirmação. O NexStock impede estoque negativo e grava a atualização do
produto, o movimento e o AuditLog em uma única transação. Se o estoque mudar
depois da prévia, a confirmação é recusada e deve ser recalculada.

## Dashboard

O NexPulse responde em texto como está o estoque e usa uma pontuação apenas
como apoio. O Radar organiza produtos sem estoque, críticos, em atenção ou
parados há 30 dias. Métricas e movimentações recentes completam a leitura sem
exigir gráficos. Forecast é declarado como indisponível até a fase de Insights,
sem gerar estimativas artificiais.

## Insights

As saídas dos últimos 30 dias alimentam uma estimativa de cobertura acompanhada
por nível de confiança. “Como calculamos isso?” apresenta dados, fórmula,
resultado e limitações. O Stock Memory deriva máximos, mínimos, reposições,
últimas operações e total movimentado somente do histórico local disponível.

## Idiomas

A interface oferece Português (Brasil), English (US) e Español no cabeçalho. A
troca ocorre sem recarregar a página e preserva a rota atual. Se uma mensagem
traduzida estiver ausente, o NexStock usa pt-BR como fallback previsível.

## Arquitetura

A interface usa navegação por hash para funcionar em subdiretórios do GitHub
Pages sem exigir regras de reescrita. A arquitetura completa seguirá:

`UI → serviços de domínio → DataProvider → provider concreto`.

Consulte [`docs/architecture/overview.md`](docs/architecture/overview.md).

## Acessibilidade

A meta é WCAG 2.2 AA onde aplicável. A fundação inclui HTML semântico, link para
pular ao conteúdo, foco visível e gerenciamento de foco nas mudanças de rota.
O projeto já recebeu um teste exploratório positivo com NVDA no Live Server.
A matriz manual completa será registrada por fluxo; combinações ainda não
executadas não são consideradas aprovadas.

## Identidade visual

Os assets oficiais estão em `assets/`. A decisão de adotar o pacote recebido
como v1.2 está registrada em
[`docs/adr/0001-brand-assets-v1.2.md`](docs/adr/0001-brand-assets-v1.2.md).

## Licença

Todos os direitos estão reservados até que o titular escolha uma licença pública
explícita.
