# Dashboard, NexPulse e Radar

## Responsabilidade

O `DashboardService` lê produtos e movimentações do workspace por meio do
`DataProvider` e gera um snapshot imutável. A view apenas traduz e apresenta
esse resultado. Nenhuma coleção do banco é duplicada no Store global.

## Fluxo de dados

1. Produtos ativos e movimentações do workspace são carregados em paralelo.
2. Produtos arquivados e movimentos sem produto ativo são excluídos.
3. Status, produto parado, percentuais e prioridades são derivados.
4. O NexPulse recebe a pontuação de apoio e os fatos usados pela narrativa.
5. Dashboard e Radar apresentam o mesmo snapshot com densidades diferentes.

## Base do NexPulse

O blueprint define pesos iniciais de 35 para Availability, 30 para Minimum
Compliance, 15 para Freshness e 20 para Forecast. Quando Forecast não pode ser
calculado, os 80 pontos disponíveis são normalizados para cem:

- disponibilidade: 43,75 por cento do cálculo atual;
- conformidade com o mínimo: 37,5 por cento;
- movimentação recente: 18,75 por cento.

Disponibilidade é a proporção de produtos com quantidade maior que zero.
Conformidade é a proporção com quantidade maior que o estoque mínimo. Freshness
é a proporção sem a condição determinística de produto parado. A pontuação é
arredondada apenas na apresentação.

A narrativa não é derivada de faixas arbitrárias da pontuação. Ela segue fatos
em ordem: produto sem estoque, crítico, atenção, parado e situação saudável.

## Produto parado

Um produto é considerado parado somente quando reúne todas as condições:

- quantidade atual maior que zero;
- criação há pelo menos 30 dias;
- nenhuma saída nos últimos 30 dias.

Entradas e ajustes não substituem a evidência de saída nessa regra.

## Radar

Cada produto aparece no máximo uma vez. A prioridade de estoque prevalece sobre
a condição de produto parado. A ordem é:

1. sem estoque;
2. crítico;
3. atenção;
4. parado.

Empates são ordenados pelo nome do produto. A lista expõe rótulo, explicação e
link nomeado para o produto; nenhuma informação depende apenas de cor.

## Forecast

Quando existe previsão calculável, Forecast volta a usar seu peso original de
20. O Dashboard informa a quantidade de produtos incluídos. Quando nenhum
produto possui saída recente, o peso continua redistribuído e a limitação é
declarada, sem estimativa artificial.
