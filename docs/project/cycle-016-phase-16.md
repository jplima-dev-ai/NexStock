# Ciclo 016 — Fase 16

## Objetivo

Implementar hardening, Central de Segurança e Shield Test Mode sem promessas absolutas.

## Entrega

- validação central de URLs com HTTP e HTTPS permitidos;
- entrada não confiável destinada a textContent;
- varredura contra eval, new Function, innerHTML, insertAdjacentHTML e document.write;
- validação das nove diretivas CSP previstas;
- Security Center com provider, modo, banco, integridade, histórico, versão e conexão;
- testes isolados para estoque negativo, NexCode duplicado, serial duplicado, HTML e URL perigosa;
- nenhuma escrita ou acesso ao DataProvider real no Shield Test Mode;
- interface equivalente nos três idiomas.

## Gate

APROVADO quando todos os testes NexShield e a suíte completa passarem também no pacote extraído.
