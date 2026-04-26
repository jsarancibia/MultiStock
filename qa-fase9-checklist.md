# QA Fase 9 - Cierre MVP

Checklist sugerido para validar el flujo completo de MultiStock en local y en produccion.

## Flujo funcional base

- Registro de usuario.
- Login y acceso a rutas privadas.
- Creacion de negocio y seleccion de rubro.
- Creacion de categoria.
- Creacion de proveedor.
- Creacion y edicion de producto.
- Movimiento de stock (compra, ajuste, merma).
- Venta con descuento de stock.
- Generacion/actualizacion de alertas.
- Visualizacion de dashboard.

## Pruebas por rubro

### Verduleria

- Producto con `is_perishable`.
- Producto con `allows_weight_sale`.
- Venta con cantidad decimal en `kg` o `g`.
- Movimiento de merma y reflejo en dashboard.

### Almacen

- Producto con `fast_rotation`.
- Producto con `suggested_margin`.
- Busqueda por codigo de barras en ventas.
- Filtro de productos por `low_margin`.

### Ferreteria

- Producto con marca/modelo/medida.
- Busqueda tecnica por marca o medida.
- Filtro `stale` en productos.
- Tarjetas tecnicas en dashboard.

## Seguridad y multi-tenant

- Verificar que consultas siempre filtren por `business_id`.
- Validar que no se vean datos de negocios ajenos.
- Confirmar RLS activo para tablas core:
  - `products`
  - `stock_movements`
  - `sales`
  - `sale_items`
  - `stock_alerts`

## Build y deploy

- `npm run lint`
- `npm run build`
- Revisar variables en Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Configurar redirects de Supabase Auth para dominio productivo.
