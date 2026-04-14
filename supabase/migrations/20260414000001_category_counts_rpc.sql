-- RPC para contar listings activos agrupados por category_id
-- Evita bajar todas las filas al cliente solo para contarlas
create or replace function get_category_counts()
returns table(category_id int, count bigint)
language sql
stable
security definer
as $$
  select category_id, count(*)::bigint
  from listings
  where status = 'active'
  group by category_id;
$$;
