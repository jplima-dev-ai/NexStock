# Sistema de identidade visual

## Direção

A identidade segue o conceito Calm Intelligence: estrutura operacional em azul
marinho, superfícies claras e nítidas, azul como ação e âmbar como assinatura da
marca. O âmbar não substitui a cor funcional de aviso.

## Componentes canônicos

`js/components/brand.js` centraliza caminhos, dimensões, proporções, classes e
textos alternativos. Views não devem reconstruir essas regras.

- `mainLogo`: Welcome, About e superfícies institucionais largas.
- `stackedLogo`: Onboarding e superfícies institucionais verticais.
- `appMark`: shell e contextos compactos.
- `symbol`: estados conceituais e About.
- `mascot`: Onboarding, Demo Tour e estados especiais permitidos.
- `hero`: Welcome em português e materiais institucionais autorizados.

## Semântica

Quando o nome ou a ideia já estão representados por texto adjacente, a imagem é
decorativa e recebe `alt=""`. Logos sem nome adjacente usam `alt="NexStock"`.
Dimensões intrínsecas são sempre informadas para evitar mudança de layout.

## Temas

Logos com wordmark permanecem sobre uma superfície clara dedicada no tema
escuro. Não é aplicado `filter: invert()`. App Mark e nome em HTML compõem o
shell, preservando legibilidade nos dois temas.

## Regras de localização

A Brand Scene contém texto em português. Ela só pode aparecer no Welcome quando
o idioma atual for `pt-BR`. A Fase 4 implementará a troca automática para
Mascot ou Brand Symbol em inglês e espanhol.
