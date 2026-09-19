# Declaração de acessibilidade

## Objetivo

O NexStock busca conformidade com WCAG 2.2 nível AA onde aplicável e considera
teclado, leitores de tela, ampliação, contraste e reflow como requisitos.

## Controles implementados

- estrutura semântica e títulos hierárquicos;
- link para pular diretamente ao conteúdo principal;
- foco visível e foco movido ao título após mudança de rota;
- formulários com rótulos, ajuda, obrigatoriedade e erros associados;
- estados comunicados por texto, não apenas por cor;
- regiões vivas para notificações, conexão e resultados assíncronos;
- diálogos com retorno de foco e operação por teclado;
- alvos interativos de pelo menos quarenta e quatro pixels;
- reflow em 320 pixels e zoom de duzentos por cento.

## Leitores de tela

O fluxo principal recebeu teste exploratório positivo com NVDA no Windows por
um usuário real. Testes automatizados verificam contratos estruturais, mas não
substituem uma matriz manual completa de navegador e tecnologia assistiva.

## Limitações conhecidas

- a arte institucional contém texto em português e só é usada no produto com
  o idioma pt-BR;
- screenshots são ilustrativos e possuem descrição textual equivalente;
- a instalação da PWA varia conforme navegador e sistema operacional.
