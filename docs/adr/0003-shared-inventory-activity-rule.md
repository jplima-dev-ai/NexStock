# ADR 0003 — Regra compartilhada de atividade de estoque

## Contexto

Dashboard e Intelligence precisavam da mesma regra para identificar produto
com estoque positivo e sem saída recente. O Dashboard também consumia sinais de
Intelligence, produzindo um ciclo de módulos.

## Decisão

Extrair a regra pura `isStoppedProduct` para
`inventory-activity-service.js`. Esse módulo não escreve dados, não acessa
DOM, provider, Store ou EventBus. Dashboard e Intelligence dependem apenas
dele e continuam responsáveis por suas próprias leituras e apresentações.

## Consequências

Elimina a dependência circular e preserva a regra idêntica nos dois fluxos.
Não cria store, migração, dependência de runtime, rede, alteração de dados,
efeito em PWA ou impacto em backup/restauração.
