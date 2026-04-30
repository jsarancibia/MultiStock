-- Seed opcional para demo local (supabase db reset).
-- Inserta datos en el primer negocio encontrado por tipo.
-- Si no hay negocio de un tipo, ese bloque no inserta filas.

-- ======================
-- VERDULERIA
-- ======================
with b as (
  select id from public.businesses where business_type = 'verduleria' order by created_at asc limit 1
),
cat as (
  insert into public.categories (business_id, name, business_type)
  select id, 'Frutas', 'verduleria' from b
  on conflict do nothing
  returning id, business_id
)
insert into public.products (
  business_id, name, unit_type, cost_price, sale_price, min_stock, current_stock, business_type, active, metadata
)
select
  b.id, p.name, p.unit_type, p.cost_price, p.sale_price, p.min_stock, p.current_stock, 'verduleria', true, p.metadata::jsonb
from b
cross join (
  values
    ('Banana', 'kg', 800, 1300, 8, 30, '{"is_perishable":true,"allows_weight_sale":true,"waste_tracking":true}'),
    ('Manzana', 'kg', 900, 1500, 6, 18, '{"is_perishable":true,"allows_weight_sale":true}'),
    ('Papa', 'kg', 500, 900, 10, 40, '{"is_perishable":false,"allows_weight_sale":true}'),
    ('Frutilla', 'unit', 1200, 1800, 6, 4, '{"is_perishable":true,"allows_weight_sale":false,"waste_tracking":true}')
) as p(name, unit_type, cost_price, sale_price, min_stock, current_stock, metadata)
on conflict do nothing;

-- ======================
-- ALMACEN
-- ======================
with b as (
  select id from public.businesses where business_type = 'almacen' order by created_at asc limit 1
)
insert into public.products (
  business_id, name, unit_type, cost_price, sale_price, min_stock, current_stock, business_type, active, metadata, sku, barcode
)
select
  b.id, p.name, p.unit_type, p.cost_price, p.sale_price, p.min_stock, p.current_stock, 'almacen', true, p.metadata::jsonb, p.sku, p.barcode
from b
cross join (
  values
    ('Leche 1L', 'unit', 900, 1400, 12, 45, '{"fast_rotation":true,"suggested_margin":30}', 'ALM-001', '779111100001'),
    ('Arroz 1kg', 'unit', 1100, 1700, 10, 28, '{"fast_rotation":true,"suggested_margin":28}', 'ALM-002', '779111100002'),
    ('Aceite 900ml', 'unit', 1800, 2550, 8, 16, '{"fast_rotation":false,"suggested_margin":22}', 'ALM-003', '779111100003'),
    ('Galletitas', 'unit', 700, 1200, 15, 50, '{"fast_rotation":true,"suggested_margin":35}', 'ALM-004', '779111100004')
) as p(name, unit_type, cost_price, sale_price, min_stock, current_stock, metadata, sku, barcode)
on conflict do nothing;

-- ======================
-- FERRETERIA
-- ======================
with b as (
  select id from public.businesses where business_type = 'ferreteria' order by created_at asc limit 1
)
insert into public.products (
  business_id, name, unit_type, cost_price, sale_price, min_stock, current_stock, business_type, active, metadata
)
select
  b.id, p.name, 'unit', p.cost_price, p.sale_price, p.min_stock, p.current_stock, 'ferreteria', true, p.metadata::jsonb
from b
cross join (
  values
    ('Tornillo 5cm', 40, 95, 100, 280, '{"brand":"FixPro","measure":"5cm","material":"acero"}'),
    ('Cinta métrica 5m', 1800, 2900, 8, 22, '{"brand":"Stanley","measure":"5m","material":"acero/plástico"}'),
    ('Llave francesa 12in', 5200, 7900, 5, 9, '{"brand":"Truper","measure":"12in","material":"acero"}'),
    ('Taladro 500W', 28500, 39900, 3, 2, '{"brand":"Makita","model":"HP1630","measure":"500W","material":"metal/plástico"}')
) as p(name, cost_price, sale_price, min_stock, current_stock, metadata)
on conflict do nothing;
