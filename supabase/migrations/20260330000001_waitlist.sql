-- Waitlist table for landing page early access signups
create table if not exists waitlist (
  id          bigint generated always as identity primary key,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- Unique emails only
create unique index if not exists waitlist_email_idx on waitlist (lower(email));

-- Only service role can read/write (no public access)
alter table waitlist enable row level security;
