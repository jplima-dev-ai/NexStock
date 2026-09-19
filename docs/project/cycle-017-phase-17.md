# Ciclo 017 — Fase 17

## Objetivo

Entregar a camada PWA definida no blueprint sem alterar a persistência local do domínio.

## Implementação

- manifest instalável com escopo e caminhos relativos;
- service worker com cache `nexstock-shell-v0.17.0`;
- shell, módulos carregados, traduções, seeds, ícones e assets essenciais disponíveis em cache;
- fallback de navegação para o shell durante indisponibilidade de rede;
- indicador offline acessível e traduzido;
- atualização acionada pelo usuário e bloqueada durante confirmação crítica de movimentação;
- rascunhos locais isolados por workspace para produtos e movimentações;
- atualização de cache sem remoção do IndexedDB.

## Gate

O fluxo central permanece disponível após a primeira visita, usando shell em cache e dados persistidos no dispositivo.
