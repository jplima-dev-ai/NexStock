# Ciclo 010 — Fase 10

## Fase

Fase 10: Insights, previsão, Confidence Meter, Explain the Math e Stock Memory.

## Objetivo

Transformar histórico de movimentações em informações úteis, reproduzíveis e
honestas sobre suas limitações.

## Alterações

- Criado `InsightService` desacoplado da interface e do provider concreto.
- Implementada previsão de cobertura com janela fixa de 30 dias.
- Precisão integral preservada no domínio e arredondamento apenas na view.
- Implementados níveis de confiança baixo, médio e alto.
- Resultados futuros são apresentados explicitamente como estimativas.
- Criado “Como calculamos isso?” com dados, fórmula, resultado e limitações.
- Implementado Stock Memory com os nove indicadores definidos no blueprint.
- Insights integrados à rota dedicada, ao Dashboard e ao produto individual.
- NexPulse passou a incorporar Forecast quando existe consumo calculável e a
  declarar a cobertura parcial de produtos.
- Elementos nativos `details` e `summary` preservam teclado e semântica para
  leitores de tela.

## Testes executados e aprovados

- `npm run validate`: setenta e quatro de setenta e quatro testes aprovados.
- Janela de 30 dias, média diária e dias restantes.
- Previsão indisponível sem saída, sem divisão artificial por zero.
- Limites do Confidence Meter e exigência de extensão histórica.
- Máximo, mínimo, zero, reposições, últimas operações e totais do Stock Memory.
- Isolamento por workspace e ordenação por menor cobertura.
- Integração de Forecast ao NexPulse e transparência de cobertura parcial.
- Trezentas e cinquenta e nove mensagens equivalentes nos três idiomas.

## Limitações declaradas

- O histórico local não representa operações anteriores à criação ou
  importação dos dados disponíveis.
- Sazonalidade, promoções, perdas e decisões futuras não são inferidas.
- A matriz manual completa com NVDA, teclado, navegadores e zoom permanece como
  gate cumulativo antes da versão 1.0.

## Gate

APROVADO. Todos os insights numéricos implementados expõem dados, cálculo,
resultado e limitações suficientes para reprodução independente.

## Próxima tarefa

Executar a Fase 11: Inventory Story determinístico e multilíngue.
