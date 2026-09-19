# Ciclo 014 — Fase 14

## Objetivo

Implementar módulos especializados sem acoplar suas regras ao Core.

## Entrega

- NexSerial com unicidade por workspace, condição, garantia e auditoria;
- NexExpiry com lotes únicos por produto e alerta inicial de 30 dias;
- NexVariants sem criação automática de combinações;
- NexKit com quantidade inteira e Missing Piece;
- NexCompat com compatible, incompatible e unknown;
- Smart Substitute baseado em relações explícitas;
- NexLifecycle com estados controlados e histórico em auditoria;
- hub modular condicionado pelos módulos do NexProfile;
- migração aditiva para integridade de serial e lote.

## Gate

APROVADO quando desligar um módulo não quebrar o Core e toda a suíte passar também no pacote extraído.
