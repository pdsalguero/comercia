create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  email_sent  boolean default false,
  created_at  timestamptz default now()
);

-- Only admins / service role can read
alter table contact_messages enable row level security;
create policy "service role only" on contact_messages
  using (false);
