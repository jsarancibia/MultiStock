# Estado de Implementacion - MultiStock

Fecha de revision: 2026-04-26

Este documento resume que hace MultiStock actualmente, tomando como referencia `arquitectura1.md`, `arquitectura2.md` y `arquitectura3.md`, y contrastandolo con el codigo implementado en el repositorio.

## Resumen ejecutivo

MultiStock ya funciona como un MVP SaaS de control de inventario multi-negocio para tres rubros iniciales:

- Verduleria.
- Almacen.
- Ferreteria.

El sistema permite que un usuario se registre, inicie sesion, cree un negocio, seleccione rubro, gestione productos, categorias, proveedores, inventario, movimientos de stock, ventas basicas, alertas y dashboard.

La personalizacion por rubro se resuelve con:

- `business_type` en el negocio.
- Configuracion en `config/business-types.ts`.
- Campos especificos guardados en `products.metadata`.
- Componentes por rubro en `modules/verduleria`, `modules/almacen` y `modules/ferreteria`.

## Arquitectura 1 - Base tecnica, base de datos y onboarding

### Implementado

- Proyecto Next.js con App Router, TypeScript y Tailwind.
- Estructura modular:
  - `app/`
  - `components/`
  - `config/`
  - `lib/`
  - `modules/`
  - `supabase/`
  - `types/`
- Clientes Supabase:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
- Variables documentadas en `.env.example`.
- Autenticacion con Supabase Auth:
  - `/auth/login`
  - `/auth/register`
- Onboarding:
  - `/onboarding`
  - creacion de negocio
  - seleccion de rubro
  - asociacion del usuario como `owner`
- Helper de negocio activo:
  - `lib/business/get-active-business.ts`
- Layout privado protegido:
  - `app/(app)/layout.tsx`
  - exige sesion y negocio activo.

### Base de datos

La migracion principal `supabase/migrations/20260424200000_init_multitenant_core.sql` crea:

- `profiles`
- `businesses`
- `business_users`
- `categories`
- `suppliers`
- `products`
- `stock_movements`
- `sales`
- `sale_items`
- `stock_alerts`

Tambien incluye:

- UUIDs como claves primarias.
- Indices por campos importantes (`business_id`, `product_id`, `created_at`, etc.).
- Checks para valores controlados.
- Triggers de `updated_at`.
- Trigger de creacion de perfil al registrarse usuario.
- Row Level Security.
- Helpers SQL:
  - `is_business_member`
  - `is_business_admin`

### Seguridad y multi-tenancy

La arquitectura multi-negocio esta implementada sobre `business_id` y RLS.

Las consultas operativas filtran por el negocio activo, y las politicas de Supabase evitan que un usuario vea o modifique datos de negocios ajenos si no pertenece a ellos.

No hay selector multi-negocio avanzado: el sistema toma como negocio activo la primera membresia disponible o el primer negocio propio.

## Arquitectura 2 - Layout, productos, inventario y alertas

### Layout interno

Implementado en `app/(app)/layout.tsx`.

El usuario autenticado ve:

- Header con nombre del negocio, rubro y email.
- Sidebar con navegacion por modulos habilitados.
- Contenido privado en rutas internas.

Componentes base implementados:

- `components/layout/app-header.tsx`
- `components/layout/app-sidebar.tsx`
- `components/layout/page-header.tsx`
- `components/ui/empty-state.tsx`
- `components/dashboard/stat-card.tsx`

### Navegacion modular

Implementada en `config/navigation.ts`.

Rutas privadas principales:

- `/dashboard`
- `/productos`
- `/inventario`
- `/ventas`
- `/proveedores`
- `/alertas`

Los modulos se habilitan segun el rubro definido en `config/business-types.ts`.

### Productos

El modulo de productos permite:

- Listar productos.
- Buscar por nombre, SKU o codigo de barras.
- Filtrar por categoria, proveedor, estado y foco por rubro.
- Crear producto.
- Editar producto.
- Ver detalle de producto.
- Desactivar producto (baja logica con `active = false`).
- Registrar stock inicial al crear producto.
- Guardar campos especificos del rubro en `metadata`.

Archivos principales:

- `app/(app)/productos/page.tsx`
- `app/(app)/productos/nuevo/page.tsx`
- `app/(app)/productos/[id]/page.tsx`
- `app/(app)/productos/[id]/editar/page.tsx`
- `components/productos/product-form.tsx`
- `components/productos/products-table.tsx`
- `components/productos/product-rubro-fields.tsx`
- `modules/core/products/actions.ts`
- `lib/validations/product.ts`

### Campos especificos por rubro

Verduleria:

- Producto perecible.
- Dias de vida util.
- Venta por peso.
- Control de merma.

Almacen:

- Alta rotacion.
- Margen sugerido.
- Categoria comercial.

Ferreteria:

- Marca.
- Modelo.
- Material.
- Medida.
- Especificaciones tecnicas.

Estos campos viven en:

- `modules/verduleria/product-fields.tsx`
- `modules/almacen/product-fields.tsx`
- `modules/ferreteria/product-fields.tsx`

### Categorias

Las categorias se gestionan desde la pantalla de productos con formulario inline.

No hay rutas separadas de categorias, pero el CRUD basico existe mediante:

- `components/forms/category-form.tsx`
- `modules/core/categories/actions.ts`
- `lib/validations/category.ts`

### Proveedores

El modulo de proveedores permite:

- Listar proveedores.
- Crear proveedor.
- Editar proveedor.
- Asociar proveedor a productos.
- Filtrar productos por proveedor.

Archivos principales:

- `app/(app)/proveedores/page.tsx`
- `app/(app)/proveedores/nuevo/page.tsx`
- `app/(app)/proveedores/[id]/editar/page.tsx`
- `components/forms/supplier-form.tsx`
- `modules/core/suppliers/actions.ts`
- `lib/validations/supplier.ts`

### Inventario

El modulo de inventario permite:

- Ver productos activos con stock actual.
- Ver productos bajo minimo.
- Registrar movimientos de stock.
- Consultar historial general de movimientos.
- Consultar historial por producto.
- Validar cantidades segun unidad.
- Evitar stock negativo.

Tipos de movimiento implementados:

- `initial_stock`
- `purchase`
- `adjustment`
- `waste`
- `return`
- `sale` (generado desde ventas)

Archivos principales:

- `app/(app)/inventario/page.tsx`
- `app/(app)/inventario/movimientos/page.tsx`
- `app/(app)/inventario/movimientos/nuevo/page.tsx`
- `app/(app)/inventario/productos/[id]/movimientos/page.tsx`
- `components/inventario/stock-table.tsx`
- `components/inventario/stock-movement-form.tsx`
- `components/inventario/movements-table.tsx`
- `modules/core/inventory/actions.ts`
- `modules/core/stock-movements/actions.ts`
- `lib/validations/stock-movement.ts`

### Alertas

El sistema genera y muestra alertas de inventario.

Implementado:

- Alertas de bajo stock (`low_stock`).
- Resolucion automatica si el stock vuelve a estar por encima del minimo.
- Alertas de producto perecible (`perishable_warning`) cuando una verduleria define vida util.
- Vista de alertas en `/alertas`.

Archivos principales:

- `app/(app)/alertas/page.tsx`
- `components/alertas/stock-alerts-list.tsx`
- `modules/core/alerts/actions.ts`

## Arquitectura 3 - Ventas, especializacion y cierre MVP

### Ventas basicas

El modulo de ventas permite:

- Ver historial de ventas.
- Crear nueva venta.
- Buscar productos activos.
- Agregar productos a un carrito.
- Modificar cantidad.
- Quitar productos.
- Calcular subtotal por item.
- Calcular total general.
- Elegir metodo de pago.
- Confirmar venta.
- Ver detalle de venta.

Metodos de pago:

- `cash`
- `debit`
- `credit`
- `transfer`
- `other`

Archivos principales:

- `app/(app)/ventas/page.tsx`
- `app/(app)/ventas/nueva/page.tsx`
- `app/(app)/ventas/[id]/page.tsx`
- `components/ventas/sale-form.tsx`
- `components/ventas/product-search.tsx`
- `components/ventas/sale-items-table.tsx`
- `components/ventas/sale-summary.tsx`
- `components/ventas/sales-table.tsx`
- `modules/core/sales/actions.ts`
- `lib/validations/sale.ts`

### Consistencia de ventas y stock

La venta se registra con una funcion SQL transaccional:

- `supabase/migrations/20260426103000_create_sale_with_items_function.sql`
- Funcion: `create_sale_with_items`

La funcion:

- Valida usuario autenticado.
- Valida membresia del negocio.
- Bloquea productos durante la operacion.
- Verifica producto activo.
- Verifica stock suficiente.
- Valida cantidades decimales segun unidad.
- Inserta `sales`.
- Inserta `sale_items`.
- Descuenta stock en `products`.
- Crea movimientos `stock_movements` tipo `sale`.
- Crea o resuelve alertas `low_stock`.

Esto evita que una venta quede parcialmente aplicada si ocurre un error.

### Personalizacion en ventas por rubro

Verduleria:

- Permite cantidades decimales en `kg`, `g`, `liter` y `meter`.
- En ventas por `kg` o `g`, al agregar repetidamente un producto suma de a `0.5`.
- Muestra ayuda sobre venta por peso.

Almacen:

- La busqueda de venta prioriza codigo de barras y SKU.
- Los productos de alta rotacion pueden aparecer priorizados.

Ferreteria:

- La busqueda puede usar datos tecnicos como marca, modelo o medida.
- El buscador muestra datos tecnicos para evitar confusiones entre productos similares.

### Dashboard MVP

El dashboard muestra metricas comunes:

- Productos activos.
- Productos bajo o en stock minimo.
- Ventas del dia.
- Movimientos recientes.
- Alertas pendientes.

Y metricas por rubro:

Verduleria:

- Productos perecibles.
- Merma reciente.

Almacen:

- Productos de alta rotacion.
- Margen promedio sobre costo.

Ferreteria:

- Productos con stock sin movimiento reciente.
- Categoria con mas SKU activos.

Archivos principales:

- `app/(app)/dashboard/page.tsx`
- `lib/business/dashboard-metrics.ts`
- `modules/verduleria/dashboard-cards.tsx`
- `modules/almacen/dashboard-cards.tsx`
- `modules/ferreteria/dashboard-cards.tsx`

### Filtros avanzados por rubro

En productos existe filtro de foco segun rubro:

Verduleria:

- `perishable`

Almacen:

- `fast_rotation`
- `low_margin`

Ferreteria:

- `stale` (productos con stock sin movimiento reciente)

Estos filtros se definen en:

- `lib/business/business-type-config.ts`
- `lib/validations/product.ts`
- `modules/core/products/actions.ts`

## Que puede hacer el programa hoy

### Como usuario

- Registrarse.
- Iniciar sesion.
- Crear un negocio.
- Elegir rubro: verduleria, almacen o ferreteria.
- Entrar al panel privado.
- Ver navegacion segun modulos habilitados.

### Como negocio

- Gestionar productos.
- Gestionar categorias.
- Gestionar proveedores.
- Controlar stock.
- Registrar movimientos manuales.
- Registrar merma.
- Registrar devoluciones.
- Ver historial de movimientos.
- Registrar ventas.
- Descontar stock automaticamente por venta.
- Ver historial y detalle de ventas.
- Ver alertas de stock.
- Ver dashboard general y por rubro.

### Como verduleria

- Crear productos perecibles.
- Definir vida util.
- Habilitar venta por peso.
- Registrar merma.
- Vender cantidades decimales.
- Ver metrica de productos perecibles.
- Ver metrica de merma reciente.

### Como almacen

- Marcar productos de alta rotacion.
- Definir margen sugerido.
- Clasificar con categoria comercial.
- Buscar ventas con prioridad de codigo de barras.
- Ver margen promedio.
- Filtrar productos por alta rotacion o margen bajo.

### Como ferreteria

- Guardar marca, modelo, material, medida y especificaciones tecnicas.
- Buscar por datos tecnicos.
- Diferenciar productos similares en listados y ventas.
- Filtrar productos sin movimiento reciente.
- Ver categoria principal por cantidad de productos activos.

## Validaciones implementadas

El proyecto usa Zod en `lib/validations`.

Validaciones disponibles:

- Auth: login y registro.
- Negocio: onboarding y rubro.
- Producto: campos comunes y filtros.
- Categoria.
- Proveedor.
- Movimiento de stock.
- Venta e items de venta.

Reglas relevantes:

- No vender productos inactivos.
- No vender mas que el stock disponible.
- No permitir stock negativo.
- Unidades no decimales requieren cantidades enteras.
- Unidades como `kg`, `g`, `liter` y `meter` aceptan decimales.
- Toda operacion server-side resuelve el negocio activo antes de consultar o mutar datos.

## Seguridad implementada

La seguridad se apoya en dos capas:

1. Aplicacion:
   - `requireUser`
   - `requireActiveBusiness`
   - filtros por `business_id`
   - server actions con validacion de usuario y negocio.

2. Base de datos:
   - RLS activado.
   - Politicas por membresia de negocio.
   - Helpers SQL `is_business_member` e `is_business_admin`.
   - Funcion transaccional de venta validando `auth.uid()` y membresia.

## Archivos importantes

Configuracion:

- `config/business-types.ts`
- `config/navigation.ts`

Supabase:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `supabase/migrations/20260424200000_init_multitenant_core.sql`
- `supabase/migrations/20260426103000_create_sale_with_items_function.sql`
- `types/database.ts`

Auth y negocio:

- `lib/auth/actions.ts`
- `lib/auth/session.ts`
- `lib/business/actions.ts`
- `lib/business/get-active-business.ts`
- `lib/business/business-type-config.ts`
- `lib/business/dashboard-metrics.ts`

Core:

- `modules/core/products/actions.ts`
- `modules/core/categories/actions.ts`
- `modules/core/suppliers/actions.ts`
- `modules/core/inventory/actions.ts`
- `modules/core/stock-movements/actions.ts`
- `modules/core/sales/actions.ts`
- `modules/core/alerts/actions.ts`

## Verificacion tecnica reciente

Se ejecuto:

```bash
npm run build
```

Resultado: build de produccion correcto, TypeScript OK y rutas generadas correctamente.

Tambien se revisaron lints en archivos modificados y no se encontraron errores.

## Diferencias respecto a los documentos de arquitectura

La implementacion cubre el MVP principal de `arquitectura1.md`, `arquitectura2.md` y `arquitectura3.md`.

Diferencias o puntos no completos al 100%:

- No hay rutas separadas para CRUD de categorias; se gestionan desde productos.
- `recharts` esta instalado pero aun no se usa en dashboard; el MVP usa tarjetas de metricas.
- No hay selector avanzado para multiples negocios por usuario.
- No hay CI/CD configurado en el repositorio.
- El deploy en Vercel y redirects de Supabase Auth siguen siendo tareas manuales.
- Algunas metricas avanzadas sugeridas quedan para evolucion futura:
  - productos mas vendidos por almacen
  - productos vendidos por peso en dashboard de verduleria
  - reportes avanzados
- `waste_warning` existe como tipo de alerta, pero la logica actual usa principalmente `low_stock` y `perishable_warning`.

## Fuera del MVP por decision de arquitectura

No esta implementado, y los documentos indican no hacerlo aun:

- Facturacion fiscal.
- Control de caja.
- Apertura/cierre de caja.
- Tickets e impresion.
- Devoluciones avanzadas.
- Clientes frecuentes.
- Descuentos complejos.
- Multi-sucursal.
- Suscripciones o pagos SaaS.
- Roles avanzados.
- Auditoria avanzada.
- App movil.
- Exportacion a Excel/PDF.
- Escaner real de codigo de barras.

## Estado actual del MVP

MultiStock esta en estado de MVP funcional.

El flujo completo disponible es:

1. Registro o login.
2. Creacion de negocio.
3. Seleccion de rubro.
4. Gestion de categorias.
5. Gestion de proveedores.
6. Gestion de productos con campos por rubro.
7. Registro de stock inicial.
8. Movimientos de inventario.
9. Alertas de stock y perecibles.
10. Ventas basicas.
11. Descuento automatico de stock.
12. Movimientos de stock tipo `sale`.
13. Dashboard general y especializado.

El producto ya puede usarse como control de inventario basico para pruebas reales con datos de negocio simulados o pilotos controlados.
