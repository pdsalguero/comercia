create table if not exists page_views (
  id         bigserial primary key,
  page       text not null default 'landing',
  referrer   text,
  created_at timestamptz not null default now()
);

-- No RLS needed — inserts via service role only
