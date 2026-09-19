create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.workspace_members where workspace_id = p_workspace_id and user_id = auth.uid()) $$;

create or replace function public.workspace_role(p_workspace_id uuid)
returns text language sql stable security definer set search_path = public
as $$ select role from public.workspace_members where workspace_id = p_workspace_id and user_id = auth.uid() $$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.workspace_role(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.workspace_role(uuid) to authenticated;

create or replace function public.add_workspace_owner()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.workspace_members(workspace_id, user_id, role) values (new.id, auth.uid(), 'owner'); return new; end $$;

drop trigger if exists workspaces_add_owner on public.workspaces;
create trigger workspaces_add_owner after insert on public.workspaces for each row execute function public.add_workspace_owner();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists workspaces_touch on public.workspaces;
create trigger workspaces_touch before update on public.workspaces for each row execute function public.touch_updated_at();

create or replace function public.apply_stock_movement(
  p_workspace_id uuid, p_product_id uuid, p_expected_before numeric, p_after_quantity numeric,
  p_movement jsonb, p_audit jsonb
) returns jsonb language plpgsql security invoker set search_path = public as $$
declare v_before public.products%rowtype; v_after public.products%rowtype; v_movement public.stock_movements%rowtype; v_audit public.audit_logs%rowtype;
begin
  if p_after_quantity < 0 then raise exception 'Stock cannot be negative' using errcode = '23514'; end if;
  select * into v_before from public.products where id = p_product_id and workspace_id = p_workspace_id and archived_at is null for update;
  if not found then raise exception 'Active product not found'; end if;
  if v_before.current_quantity <> p_expected_before then raise exception 'Stock changed after preview' using errcode = '40001'; end if;
  update public.products set current_quantity = p_after_quantity, updated_at = (p_movement->>'created_at')::timestamptz where id = p_product_id returning * into v_after;
  insert into public.stock_movements(id,workspace_id,product_id,product_unit_id,batch_id,type,quantity,before_quantity,after_quantity,reason,notes,created_at)
  values ((p_movement->>'id')::uuid,p_workspace_id,p_product_id,(p_movement->>'product_unit_id')::uuid,(p_movement->>'batch_id')::uuid,p_movement->>'type',(p_movement->>'quantity')::numeric,v_before.current_quantity,p_after_quantity,p_movement->>'reason',coalesce(p_movement->>'notes',''),(p_movement->>'created_at')::timestamptz)
  returning * into v_movement;
  insert into public.audit_logs(id,workspace_id,entity_type,entity_id,action,before_data,after_data,metadata,created_at)
  values ((p_audit->>'id')::uuid,p_workspace_id,'product',p_product_id,p_audit->>'action',to_jsonb(v_before),to_jsonb(v_after),coalesce(p_audit->'metadata','{}'::jsonb),(p_audit->>'created_at')::timestamptz)
  returning * into v_audit;
  return jsonb_build_object('product',to_jsonb(v_after),'movement',to_jsonb(v_movement),'audit',to_jsonb(v_audit));
end $$;

revoke all on function public.apply_stock_movement(uuid,uuid,numeric,numeric,jsonb,jsonb) from public;
grant execute on function public.apply_stock_movement(uuid,uuid,numeric,numeric,jsonb,jsonb) to authenticated;
