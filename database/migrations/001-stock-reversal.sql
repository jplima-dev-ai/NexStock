begin;

alter table public.stock_movements
  add column if not exists reversal_of_movement_id uuid references public.stock_movements(id) on delete restrict;

create unique index if not exists stock_movements_single_reversal_idx
  on public.stock_movements(reversal_of_movement_id)
  where reversal_of_movement_id is not null;

commit;
