-- Búsqueda por código de barras filtrada por negocio (arquitectura 14)
create index if not exists idx_products_business_barcode
on public.products (business_id, barcode)
where barcode is not null and barcode <> '';
