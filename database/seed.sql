-- O modo público do NexStock usa seeds locais em /demo para que visitantes não
-- compartilhem dados. Este arquivo é intencionalmente não destrutivo.
-- Em um projeto Supabase autenticado, o próprio usuário cria seu workspace;
-- o trigger workspaces_add_owner registra a associação com auth.uid().
select 'NexStock remote schema ready; demo data remains local-first.' as status;
