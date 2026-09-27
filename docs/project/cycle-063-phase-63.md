# Ciclo 063 — PWA Update Center

Fase 63. Release alvo: v1.8.0 Local-first Excellence. A Central PWA mostra
versão, disponibilidade de instalação, cache offline e estado da atualização.
Quando existe uma operação crítica, a atualização fica adiada e não pode ser
aplicada pela interface.

Não houve nova dependência, backend ou migração. O service worker continua
relativo para GitHub Pages e o IndexedDB não é apagado por atualização.

## Gate

APROVADO — atualização não interrompe transação crítica. A suíte direcionada
confirma que a ação fica indisponível sem atualização e que o estado adiado é
exposto em texto; a suíte unitária preserva o bloqueio antes do `SKIP_WAITING`.
