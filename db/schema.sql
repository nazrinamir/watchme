create table public.staff (
  id bigint generated always as identity primary key,
  name text not null,
  status text,
  status_minutes integer,
  status_until timestamptz,
  return_status text,
  current_note text not null default '',
  previous_note text not null default '',
  ping_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_name_not_blank check (char_length(btrim(name)) between 1 and 80),
  constraint staff_current_note_length check (char_length(current_note) <= 128),
  constraint staff_previous_note_length check (char_length(previous_note) <= 128),
  constraint staff_ping_count_check check (ping_count >= 0),
  constraint staff_status_minutes_check check (
    status_minutes is null
    or (
      status in ('toilet', 'solat', 'afk')
      and status_minutes between 1 and 240
    )
  ),
  constraint staff_return_status_check check (
    return_status is null
    or return_status in ('focus', 'do_not_disturb')
  ),
  constraint staff_status_check check (
    status is null
    or status in ('focus', 'do_not_disturb', 'toilet', 'solat', 'afk')
  )
);

create unique index staff_name_unique on public.staff (lower(btrim(name)));

alter table public.staff enable row level security;

revoke all on table public.staff from anon, authenticated, service_role;

create table public.status_log (
  id bigint generated always as identity primary key,
  staff_id bigint references public.staff (id) on delete set null,
  staff_name text not null,
  status text not null,
  status_minutes integer,
  event text not null default 'set',
  from_status text,
  return_status text,
  created_at timestamptz not null default now(),
  constraint status_log_name_not_blank check (char_length(btrim(staff_name)) between 1 and 80),
  constraint status_log_status_check check (
    status in ('focus', 'do_not_disturb', 'toilet', 'solat', 'afk')
  ),
  constraint status_log_event_check check (
    event in ('set', 'ended', 'expired')
  ),
  constraint status_log_minutes_check check (
    status_minutes is null
    or (
      status in ('toilet', 'solat', 'afk')
      and status_minutes between 1 and 240
    )
  )
);

create index status_log_created_at_idx on public.status_log (created_at desc);

alter table public.status_log enable row level security;

revoke all on table public.status_log from anon, authenticated, service_role;

create table public.app_reset (
  id integer primary key default 1 check (id = 1),
  last_reset_on date
);

create or replace function public.apply_daily_reset()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  local_now timestamp;
  boundary date;
  already date;
begin
  local_now := now() at time zone 'Asia/Kuala_Lumpur';
  boundary := local_now::date - case
    when local_now::time >= time '22:00' then 0
    else 1
  end;

  insert into app_reset (id) values (1) on conflict (id) do nothing;
  select last_reset_on into already from app_reset where id = 1 for update;

  if already is not null and already >= boundary then
    return;
  end if;

  update staff
  set
    status = null,
    status_minutes = null,
    status_until = null,
    return_status = null,
    ping_count = 0,
    current_note = '',
    previous_note = '';

  delete from status_log;

  update app_reset set last_reset_on = boundary where id = 1;
end;
$$;

revoke all on function public.apply_daily_reset() from public, anon, authenticated;

alter table public.app_reset enable row level security;

revoke all on table public.app_reset from anon, authenticated, service_role;

create table public.lunch_schedule (
  id integer primary key default 1 check (id = 1),
  start_time time not null default time '13:00',
  end_time time not null default time '14:00',
  constraint lunch_schedule_window_check check (start_time <> end_time)
);

alter table public.lunch_schedule enable row level security;

revoke all on table public.lunch_schedule from anon, authenticated, service_role;
