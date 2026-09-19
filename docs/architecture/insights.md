# Insights, previsão e Stock Memory

## Responsabilidade

O `InsightService` transforma produtos e movimentações persistidas em resultados
determinísticos. Nenhuma previsão altera estoque e nenhuma informação futura é
apresentada como certeza.

## Previsão de cobertura

A janela móvel é de 30 dias. Somente movimentos do tipo `OUT` dentro dessa
janela entram no cálculo.

```text
averageDailyOut = totalOut30Days / 30
daysRemaining = currentQuantity / averageDailyOut
```

Os valores permanecem com precisão completa no domínio. O arredondamento ocorre
somente na apresentação. Quando `averageDailyOut` é zero, `daysRemaining` é
`null` e a interface declara a previsão como indisponível.

## Confidence Meter

- baixa: menos de cinco eventos de saída;
- média: de cinco a quatorze eventos, ou quinze eventos sem quatorze dias de
  extensão histórica;
- alta: quinze ou mais eventos e histórico cobrindo pelo menos quatorze dias.

A confiança qualifica a estimativa; não converte previsão em certeza.

## Explain the Math

Cada previsão expõe um elemento nativo `details` com:

1. janela, quantidade atual, total de saídas, eventos e período observado;
2. fórmula da média diária;
3. fórmula da cobertura;
4. resultado;
5. limitações aplicáveis.

O elemento `summary` é operável pelo teclado e reconhecido semanticamente por
leitores de tela sem um widget ARIA personalizado.

## Stock Memory

A memória usa as quantidades `beforeQuantity` e `afterQuantity` dos movimentos,
além da quantidade atual, para derivar:

- máximo e mínimo históricos disponíveis;
- última vez em zero;
- reposições;
- última entrada e última saída;
- maior saída;
- total movimentado;
- dias desde a última movimentação.

O histórico é local. Operações anteriores aos dados existentes não podem ser
reconstruídas e essa limitação é apresentada na interface.

## Integração com NexPulse

Quando ao menos um produto tem previsão calculável, o NexPulse incorpora a
dimensão Forecast com peso 20. Para cada produto calculável, a cobertura recebe
até cem pontos, usando 30 dias como referência. O painel informa quantos
produtos participaram.

Sem previsão calculável, o peso de Forecast é redistribuído entre
disponibilidade, conformidade com o mínimo e movimentação recente.
