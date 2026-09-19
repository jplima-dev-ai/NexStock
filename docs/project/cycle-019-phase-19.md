# Ciclo 019 — Fase 19

## Objetivo

Adicionar PostgreSQL/Supabase como persistência profissional opcional sem acoplar a interface e sem expor segredos administrativos.

## Implementação

- schema PostgreSQL para o domínio completo;
- dinheiro em `numeric` e datas em `timestamptz`;
- PK, FK, UNIQUE, CHECK e NOT NULL;
- vínculos compostos que impedem referências entre workspaces;
- índices de consultas operacionais;
- RLS em todas as tabelas expostas;
- policies para owner, editor e viewer;
- associação automática do criador como owner;
- RPC transacional para movimentações e auditoria;
- `SupabaseProvider` com mapeamento camelCase e snake_case;
- factory para alternar IndexedDB e Supabase por configuração;
- bloqueio de HTTP e de chaves `service_role` no frontend;
- CSP liberada somente para conexões HTTPS com projetos Supabase.

## Gate

O provider pode ser alternado por configuração declarativa. O padrão continua local, e nenhum segredo administrativo está presente no frontend.
