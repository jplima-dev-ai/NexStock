# PostgreSQL e Supabase

## Estratégia

O IndexedDB permanece como provider padrão. O `SupabaseProvider` implementa o mesmo contrato e pode ser escolhido sem alterar views ou serviços de domínio.

## Configuração pública

No `index.html`, altere `nexstock-data-provider` para `supabase` e acrescente metadados `nexstock-supabase-url` e `nexstock-supabase-publishable-key`. Somente URL pública e chave publicável podem estar no cliente. Uma chave `service_role` é recusada.

O token de acesso do usuário deve ser fornecido ao provider pela camada futura de autenticação. Sem sessão autenticada, as policies RLS recusam os dados privados.

## Ordem de aplicação SQL

1. `schema.sql`;
2. `constraints.sql`;
3. `indexes.sql`;
4. `functions.sql`;
5. `policies.sql`;
6. `seed.sql`.

## Isolamento

Cada registro de domínio possui `workspace_id`. As policies consultam a associação entre usuário e workspace. Chaves estrangeiras compostas impedem relações acidentais entre workspaces.

Movimentações usam a função `apply_stock_movement`, que bloqueia a linha do produto, compara a quantidade da prévia e grava produto, movimento e auditoria na mesma transação.
