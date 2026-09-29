# Ciclo 077 — 2.0 Release Candidate

Fase 77. Release alvo: v2.0.0 Calm Intelligence. O produto entrou no
candidato `2.0.0-rc.1` sem acrescentar funcionalidade. A versão do núcleo,
pacote e service worker foi alinhada, inclusive no nome do cache PWA; assim uma
atualização não reutiliza acidentalmente o shell da versão estável anterior.

O congelamento está documentado e é verificável: até a Fase 78 somente bug,
segurança, acessibilidade, performance, regressão e copy são aceitos. Não há
migração, novo store IndexedDB, alteração de domínio, provider, backup,
restauração, mídia Blob, NexShield, NexCopy, NexMotion, rota ou dependência de
runtime. GitHub Pages continua sendo um artefato estático e a PWA permanece
offline com cache versionado.

As interfaces não receberam nova interação. Portanto, teclado, ordem de foco,
semântica, leitor de tela, contraste, zoom e reduced motion preservam os
contratos validados na Fase 76; as cópias existentes em pt-BR, en-US e es não
foram modificadas.

## Gate

APROVADO — release candidate congelado; a auditoria final da Fase 78 é a única
via para formalizar a versão estável `2.0.0`.
