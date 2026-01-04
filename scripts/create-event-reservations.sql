-- Event reservations (Activities only)
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.event_reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  seats integer not null default 1 check (seats > 0),
  status text not null default 'reserved' check (status in ('reserved', 'checked_in', 'cancelled')),
  qr_code text not null unique,
  reserved_at timestamptz not null default now(),
  checked_in_at timestamptz,
  checked_in_by_admin uuid references public.admins(id),
  payment_id uuid references public.payments(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_reservations_event_status on public.event_reservations(event_id, status);
create index if not exists idx_event_reservations_user on public.event_reservations(user_id, created_at desc);
create index if not exists idx_event_reservations_qr on public.event_reservations(qr_code);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_event_reservations_updated_at on public.event_reservations;
create trigger trg_event_reservations_updated_at
before update on public.event_reservations
for each row
execute function public.set_updated_at();

-- RLS (optional; API uses service role, but this keeps data safe)
alter table public.event_reservations enable row level security;

drop policy if exists "Users can view their reservations" on public.event_reservations;
create policy "Users can view their reservations"
on public.event_reservations
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create their reservations" on public.event_reservations;
create policy "Users can create their reservations"
on public.event_reservations
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can cancel their reservations" on public.event_reservations;
create policy "Users can cancel their reservations"
on public.event_reservations
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());




