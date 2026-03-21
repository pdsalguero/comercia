create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references profiles(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  listing_id  uuid references listings(id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (char_length(comment) <= 500),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (seller_id, reviewer_id)
);

alter table reviews enable row level security;

drop policy if exists "reviews_public_read" on reviews;
drop policy if exists "reviews_own_insert"  on reviews;
drop policy if exists "reviews_own_update"  on reviews;
drop policy if exists "reviews_own_delete"  on reviews;

create policy "reviews_public_read"  on reviews for select using (true);
create policy "reviews_own_insert"   on reviews for insert  with check (auth.uid() = reviewer_id);
create policy "reviews_own_update"   on reviews for update  using     (auth.uid() = reviewer_id);
create policy "reviews_own_delete"   on reviews for delete  using     (auth.uid() = reviewer_id);

-- Keep updated_at fresh on edits
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger reviews_set_updated_at
  before update on reviews
  for each row execute function set_updated_at();
