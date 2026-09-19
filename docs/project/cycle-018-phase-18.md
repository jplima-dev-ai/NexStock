# Ciclo 018 — Fase 18

## Objetivo

Transformar a experiência móvel em uma composição própria, com reflow e interação adequados, sem comprimir o desktop.

## Implementação

- navegação móvel recolhível com estado acessível;
- navegação lateral persistente em espaços amplos;
- cabeçalho e ações reorganizados em coluna em telas estreitas;
- formulários de uma coluna no mobile e duas colunas quando há espaço;
- botões críticos com largura disponível no mobile;
- tabelas com rolagem horizontal somente no próprio componente;
- diálogos limitados ao viewport e ajustados para baixa altura;
- textos longos, dados e traduções protegidos contra quebra de layout;
- alvos interativos importantes com pelo menos 44 pixels CSS;
- reflow compatível com zoom de duzentos por cento sem bloquear ampliação.

## Matriz verificada por contrato automatizado

- 320 pixels;
- 375 pixels;
- 768 pixels;
- 1366 pixels;
- viewport efetivo de 683 pixels, equivalente a desktop de 1366 pixels com zoom de duzentos por cento.

## Limitação registrada

O navegador remoto disponível bloqueou o endereço local. A fase foi validada por contratos automatizados de CSS, DOM, semântica, componentes e regressão; a inspeção visual em navegador local deve compor o QA final.

## Gate

Mobile possui navegação, agrupamento de ações e composição próprios; não é uma versão comprimida do desktop.
