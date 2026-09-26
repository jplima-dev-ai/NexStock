# Ciclo 053 — Scenario Comparison

O comparador mantém o estoque real como referência e mostra três alternativas
virtuais, A, B e C. Para cada alternativa, apresenta quantidade, estoque
mínimo, status, impacto, previsão e sinais de risco calculados localmente.

Nenhum cenário chama provider, cria movimentação ou grava no IndexedDB. A tela
usa cartões em sequência com títulos explícitos, apropriados para teclado,
leitor de tela e zoom.

## Gate

APROVADO quando Real, A, B e C forem distinguíveis e comparáveis sem depender
de gráficos ou de mudanças no estoque real.
