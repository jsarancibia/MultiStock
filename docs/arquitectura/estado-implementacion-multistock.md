# Estado de Implementacion - MultiStock

Fecha de revision: 2026-04-29

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

## Arquitectura UI agregada

Se agregaron documentos de arquitectura para guiar el rediseño visual y la simplificacion de flujos:

- `arquitectura7.md`: direccion visual UI, dashboard SaaS, sidebar oscura, tarjetas, colores y sistema visual reutilizable.
- `arquitectura8.md`: flujos simples para productos, ventas, inventario, movimientos y onboarding.
- `arquitectura9.md`: roadmap de implementacion UI por fases pequeñas, sin reescribir el producto completo.

Estos documentos toman como referencia una interfaz de dashboard moderna con navegacion lateral oscura, metricas visibles, cards claras, graficos simples y acciones rapidas.

Avance de ejecucion:

- `arquitectura7.md`: aplicado (shell visual, dashboard profesional, componentes de UI reutilizables).
- `arquitectura8.md`: aplicado (formularios y flujos simplificados en productos, ventas, inventario y onboarding).
- `arquitectura9.md`: en ejecucion por fases (se consolidaron fases 25 a 29 con enfoque UI/UX y accesibilidad basica).
- `arquitectura10.md`: documenta ajustes de layout: header superior profesional, sidebar cafe fijo, pantalla completa y responsive real (aplicado en `app-header`, `app-shell`, `app-sidebar` y `business-switcher`).

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

## Detalle integral del proyecto al 2026-04-29

Esta seccion agrega una vista completa del estado actual del repositorio y de las capacidades reales visibles en codigo. Complementa el resumen anterior y deja documentado todo lo que el proyecto contiene hoy.

### Identidad del producto

MultiStock es una aplicacion web SaaS para control de inventario, ventas simples y alertas operativas de pequenos comercios. El producto esta pensado para funcionar con un nucleo comun y una personalizacion por rubro.

Rubros activos:

- Verduleria.
- Almacen.
- Ferreteria.

La propuesta actual es permitir que un usuario cree una cuenta, configure un negocio, elija rubro y opere desde un panel privado con modulos adaptados a su actividad.

### Stack tecnico actual

- Framework: Next.js 16.2.4 con App Router.
- UI: React 19.2.4, Tailwind CSS 4, shadcn y componentes propios.
- Backend: Supabase.
- Base de datos: PostgreSQL con migraciones SQL.
- Autenticacion: Supabase Auth.
- Validaciones: Zod.
- Formularios: React Hook Form.
- Tablas: TanStack Table.
- Graficos y visualizaciones simples: Recharts instalado y componentes internos de tarjetas/graficos.
- Iconos: Lucide React.
- Temas: `next-themes`.

Scripts disponibles en `package.json`:

- `npm run dev`: desarrollo local.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build.
- `npm run lint`: linter.
- `npm run db:push`: push de base con script local.
- `npm run db:push:link`: push con Supabase CLI.
- `npm run db:start`: levantar Supabase local.

### Estructura general del repositorio

- `app/`: rutas publicas, autenticacion, onboarding y aplicacion privada.
- `components/`: componentes visuales por dominio y componentes reutilizables.
- `config/`: configuracion de rubros, navegacion, assets de marca y feature flags.
- `lib/`: helpers de auth, negocio activo, Supabase, validaciones, auditoria, errores y utilidades.
- `modules/`: acciones server-side del core y extensiones por rubro.
- `supabase/`: migraciones y seed.
- `types/`: tipos generados o mantenidos para base de datos.
- `docs/`: documentacion operativa y roadmap.
- `assets/`: assets fuente de logo y descripciones usadas para generar marca.
- `public/brand`: logos y favicons consumidos por la aplicacion.

### Sitio publico

El proyecto ya tiene una capa publica separada de la aplicacion privada mediante `app/(site)`.

Rutas publicas:

- `/`: landing principal con propuesta de valor, beneficios y llamadas a registro/demo.
- `/features`: listado de funcionalidades disponibles.
- `/pricing`: planes orientativos sin cobro real in-app.
- `/demo`: recorrido visual del producto con mockups y placeholders reemplazables por capturas reales.

Componentes principales:

- `components/marketing/marketing-nav.tsx`.
- `components/marketing/marketing-footer.tsx`.
- `components/marketing/dashboard-mockup.tsx`.
- `components/brand/brand-logo.tsx`.

Comportamiento relevante:

- Si el usuario ya inicio sesion y tiene negocio activo, la landing redirige a `/dashboard`.
- Si el usuario tiene sesion pero no negocio, redirige a `/onboarding`.
- La demo publica muestra un flujo sugerido: panel, productos/inventario, nueva venta y alertas.

### Autenticacion y onboarding

Rutas:

- `/auth/login`.
- `/auth/register`.
- `/onboarding`.

Capacidades:

- Registro de usuario con Supabase Auth.
- Inicio de sesion.
- Creacion del negocio.
- Seleccion del rubro.
- Asociacion del usuario como propietario del negocio.
- Redireccion al panel privado cuando el negocio queda listo.

Archivos principales:

- `app/auth/login/page.tsx`.
- `app/auth/register/page.tsx`.
- `app/onboarding/page.tsx`.
- `components/forms/login-form.tsx`.
- `components/forms/register-form.tsx`.
- `components/forms/onboarding-form.tsx`.
- `lib/auth/actions.ts`.
- `lib/auth/session.ts`.
- `lib/business/actions.ts`.
- `lib/validations/auth.ts`.
- `lib/validations/business.ts`.

### Aplicacion privada

La aplicacion privada vive en `app/(app)` y se renderiza con un layout protegido.

Rutas privadas actuales:

- `/dashboard`.
- `/productos`.
- `/productos/nuevo`.
- `/productos/[id]`.
- `/productos/[id]/editar`.
- `/inventario`.
- `/inventario/movimientos`.
- `/inventario/movimientos/nuevo`.
- `/inventario/productos/[id]/movimientos`.
- `/ventas`.
- `/ventas/nueva`.
- `/ventas/[id]`.
- `/proveedores`.
- `/proveedores/nuevo`.
- `/proveedores/[id]/editar`.
- `/alertas`.
- `/auditoria`.
- `/reportes`.
- `/exportaciones`.

El layout privado:

- Exige usuario autenticado.
- Exige negocio activo.
- Muestra header superior con negocio, rubro y email.
- Muestra sidebar responsive con modulos habilitados.
- Usa un `AppShell` full viewport con scroll principal en el contenido.
- Incluye selector de negocio cuando el usuario tiene mas de un negocio disponible.

Archivos principales:

- `app/(app)/layout.tsx`.
- `components/layout/app-shell.tsx`.
- `components/layout/app-header.tsx`.
- `components/layout/app-sidebar.tsx`.
- `components/layout/business-switcher.tsx`.
- `components/layout/page-header.tsx`.

### Negocio activo y multi-negocio

El sistema ya incluye una base de multi-negocio mas avanzada que el MVP inicial.

Implementado:

- `listUserBusinesses(userId)` lista negocios por membresia y por propiedad.
- `getActiveBusiness(userId)` intenta usar la cookie de negocio activo.
- Si no hay cookie valida, toma el primer negocio disponible.
- `setActiveBusinessAction(formData)` valida que el negocio pertenezca al usuario antes de guardar la cookie.
- La cookie `multistock_active_business_id` es `httpOnly`, `sameSite=lax`, `secure` en produccion y dura 30 dias.

Archivos principales:

- `lib/business/get-active-business.ts`.
- `lib/business/active-business-cookie.ts`.
- `components/layout/business-switcher.tsx`.

Limitacion:

- Existe selector de negocio activo, pero aun no hay pantalla completa de administracion de multiples negocios, invitaciones o roles avanzados.

### Configuracion por rubro

La configuracion central vive en:

- `config/business-types.ts`.
- `lib/business/business-type-config.ts`.
- `config/navigation.ts`.

Rubros y modulos:

- Verduleria: productos, inventario, ventas, proveedores y manejo de merma.
- Almacen: productos, inventario, ventas, proveedores y foco en margenes/rotacion.
- Ferreteria: productos, inventario, ventas, proveedores y datos tecnicos.

La navegacion habilita siempre:

- Dashboard.
- Alertas.
- Auditoria.
- Reportes.
- Exportaciones.

Y agrega modulos operativos segun rubro:

- Productos.
- Inventario.
- Ventas.
- Proveedores.

### Dashboard

El dashboard resume el estado operativo del negocio activo.

Capacidades:

- Productos activos.
- Productos bajo minimo o en alerta.
- Ventas del dia.
- Movimientos recientes.
- Alertas pendientes.
- Paneles por rubro.
- Acciones rapidas.
- Actividad reciente.
- Productos principales.
- Categorias principales.
- Panel de bajo stock.
- Barras o visualizaciones simples de tendencia.

Archivos principales:

- `app/(app)/dashboard/page.tsx`.
- `lib/business/dashboard-metrics.ts`.
- `components/dashboard/dashboard-section.tsx`.
- `components/dashboard/dashboard-quick-actions.tsx`.
- `components/dashboard/low-stock-panel.tsx`.
- `components/dashboard/recent-activity.tsx`.
- `components/dashboard/top-categories-panel.tsx`.
- `components/dashboard/top-products-panel.tsx`.
- `components/dashboard/trend-bars.tsx`.
- `modules/verduleria/dashboard-cards.tsx`.
- `modules/almacen/dashboard-cards.tsx`.
- `modules/ferreteria/dashboard-cards.tsx`.

### Productos

El modulo de productos permite gestionar el catalogo del negocio.

Capacidades:

- Listado de productos.
- Busqueda por nombre, SKU o codigo de barras.
- Filtros por categoria, proveedor, estado y foco por rubro.
- Alta de producto.
- Edicion de producto.
- Detalle de producto.
- Baja logica mediante `active = false`.
- Stock inicial al crear producto.
- Campos comunes: nombre, SKU, codigo de barras, unidad, costo, precio, stock minimo, stock actual, categoria y proveedor.
- Campos por rubro guardados en `metadata`.
- Secciones visuales separadas para datos basicos, precios y campos de negocio.

Archivos principales:

- `app/(app)/productos/page.tsx`.
- `app/(app)/productos/nuevo/page.tsx`.
- `app/(app)/productos/[id]/page.tsx`.
- `app/(app)/productos/[id]/editar/page.tsx`.
- `components/productos/product-form.tsx`.
- `components/productos/products-table.tsx`.
- `components/productos/product-basic-section.tsx`.
- `components/productos/product-pricing-section.tsx`.
- `components/productos/product-business-fields.tsx`.
- `components/productos/product-rubro-fields.tsx`.
- `modules/core/products/actions.ts`.
- `lib/validations/product.ts`.

Campos por rubro:

- Verduleria: perecible, dias de vida util, venta por peso y control de merma.
- Almacen: alta rotacion, margen sugerido y categoria comercial.
- Ferreteria: marca, modelo, material, medida y especificaciones tecnicas.

### Categorias

Las categorias no tienen ruta independiente, pero si tienen CRUD operativo desde el flujo de productos.

Capacidades:

- Crear categoria.
- Asociar categoria a productos.
- Filtrar productos por categoria.
- Registrar auditoria al crear categoria.

Archivos principales:

- `components/forms/category-form.tsx`.
- `modules/core/categories/actions.ts`.
- `lib/validations/category.ts`.

### Proveedores

El modulo de proveedores administra contactos comerciales asociados al negocio.

Capacidades:

- Listado de proveedores.
- Alta de proveedor.
- Edicion de proveedor.
- Asociacion de proveedor a productos.
- Filtro de productos por proveedor.
- Auditoria de altas y ediciones.

Archivos principales:

- `app/(app)/proveedores/page.tsx`.
- `app/(app)/proveedores/nuevo/page.tsx`.
- `app/(app)/proveedores/[id]/editar/page.tsx`.
- `components/forms/supplier-form.tsx`.
- `modules/core/suppliers/actions.ts`.
- `lib/validations/supplier.ts`.

### Inventario y movimientos

El modulo de inventario centraliza stock actual y trazabilidad de cambios.

Capacidades:

- Ver stock actual por producto.
- Ver stock minimo.
- Identificar productos bajo stock.
- Registrar movimientos manuales.
- Consultar historial general de movimientos.
- Consultar historial por producto.
- Validar cantidades segun unidad.
- Evitar stock negativo.
- Registrar auditoria de cambios de stock.

Tipos de movimiento:

- `initial_stock`.
- `purchase`.
- `adjustment`.
- `waste`.
- `return`.
- `sale`.

Archivos principales:

- `app/(app)/inventario/page.tsx`.
- `app/(app)/inventario/movimientos/page.tsx`.
- `app/(app)/inventario/movimientos/nuevo/page.tsx`.
- `app/(app)/inventario/productos/[id]/movimientos/page.tsx`.
- `components/inventario/stock-table.tsx`.
- `components/inventario/stock-movement-form.tsx`.
- `components/inventario/movements-table.tsx`.
- `modules/core/inventory/actions.ts`.
- `modules/core/stock-movements/actions.ts`.
- `lib/business/movement-type-labels.ts`.
- `lib/validations/stock-movement.ts`.

### Ventas

El modulo de ventas permite registrar operaciones simples y descontar stock.

Capacidades:

- Historial de ventas.
- Nueva venta.
- Busqueda de productos activos.
- Carrito de venta.
- Edicion de cantidades.
- Eliminacion de items.
- Calculo de subtotal por item.
- Calculo de total general.
- Metodos de pago.
- Confirmacion de venta.
- Detalle de venta.
- Descuento automatico de stock.
- Generacion de movimientos `sale`.
- Auditoria de venta confirmada.

Metodos de pago:

- `cash`.
- `debit`.
- `credit`.
- `transfer`.
- `other`.

Archivos principales:

- `app/(app)/ventas/page.tsx`.
- `app/(app)/ventas/nueva/page.tsx`.
- `app/(app)/ventas/[id]/page.tsx`.
- `components/ventas/sale-form.tsx`.
- `components/ventas/product-search.tsx`.
- `components/ventas/sale-items-table.tsx`.
- `components/ventas/sale-summary.tsx`.
- `components/ventas/sales-table.tsx`.
- `components/ventas/new-sale-shortcut.tsx`.
- `modules/core/sales/actions.ts`.
- `lib/validations/sale.ts`.

La confirmacion de venta usa la funcion SQL transaccional `create_sale_with_items`, definida en:

- `supabase/migrations/20260426103000_create_sale_with_items_function.sql`.

Esa funcion valida membresia, producto activo, stock suficiente y cantidades, y aplica todos los cambios en una sola transaccion.

### Alertas

El modulo de alertas muestra eventos operativos relevantes del negocio.

Capacidades:

- Alertas de bajo stock.
- Alertas de productos perecibles.
- Resolucion de alertas.
- Resolucion automatica cuando el stock vuelve a estar por encima del minimo.
- Auditoria al resolver alertas.

Tipos previstos:

- `low_stock`.
- `out_of_stock`.
- `perishable_warning`.
- `waste_warning`.

Archivos principales:

- `app/(app)/alertas/page.tsx`.
- `components/alertas/stock-alerts-list.tsx`.
- `modules/core/alerts/actions.ts`.

### Auditoria

El proyecto ya incluye auditoria operativa visible desde la aplicacion.

Ruta:

- `/auditoria`.

Capacidades:

- Listar acciones sensibles del negocio activo.
- Mostrar fecha, usuario, entidad, accion y resumen.
- Registrar auditoria sin romper el flujo principal si falla la insercion.
- Proteger registros por negocio mediante RLS.

Entidades auditables:

- Producto.
- Movimiento de stock.
- Venta.
- Proveedor.
- Categoria.
- Alerta de stock.
- Negocio.

Acciones auditables:

- Alta.
- Edicion.
- Baja.
- Desactivacion.
- Cambio de stock.
- Cambio de precio.
- Venta confirmada.
- Alerta resuelta.

Archivos principales:

- `app/(app)/auditoria/page.tsx`.
- `components/auditoria/audit-table.tsx`.
- `modules/core/audit/actions.ts`.
- `lib/audit/create-audit-log.ts`.
- `supabase/migrations/20260427120000_create_audit_logs.sql`.

### Reportes

El proyecto incluye reportes simples para operacion diaria.

Ruta:

- `/reportes`.

Capacidades:

- Ventas por dia.
- Productos mas vendidos.
- Productos bajo stock.
- Movimientos por dia.
- Merma por dia.

Los reportes consultan datos del negocio activo y resumen los ultimos registros disponibles.

Archivos principales:

- `app/(app)/reportes/page.tsx`.
- `modules/core/reports/actions.ts`.

### Exportaciones

El proyecto incluye exportaciones CSV desde la aplicacion.

Ruta:

- `/exportaciones`.

Exportaciones disponibles:

- `productos.csv`.
- `inventario.csv`.
- `movimientos.csv`.
- `ventas.csv`.
- `alertas.csv`.

Cada exportacion se genera en server actions como texto CSV escapado y se descarga desde enlaces `data:text/csv`.

Archivos principales:

- `app/(app)/exportaciones/page.tsx`.
- `modules/core/reports/actions.ts`.

### UI, estados de carga y errores

La interfaz fue ampliada con componentes reutilizables y estados por modulo.

Componentes UI destacados:

- `components/ui/button.tsx`.
- `components/ui/action-card.tsx`.
- `components/ui/empty-state.tsx`.
- `components/ui/table-empty-state.tsx`.
- `components/ui/form-message.tsx`.
- `components/ui/inline-error.tsx`.
- `components/ui/metric-card.tsx`.
- `components/ui/page-error-state.tsx`.
- `components/ui/page-surface.tsx`.
- `components/ui/simple-chart-card.tsx`.
- `components/ui/status-ring.tsx`.
- `components/ui/task-list-card.tsx`.
- `components/ui/theme-toggle.tsx`.

Estados por ruta:

- Loading general privado: `app/(app)/loading.tsx`.
- Loading y error para dashboard.
- Loading y error para productos.
- Loading y error para inventario.
- Loading y error para ventas.
- Loading y error para proveedores.
- Loading y error para alertas.

Esto mejora la experiencia durante cargas, fallos de server components y navegacion interna.

### Marca, logos y favicons

El proyecto ya tiene sistema de marca documentado y centralizado.

Implementado:

- Logos publicos en `public/brand/logos`.
- Favicons por tono y tamano en `public/brand/favicons`.
- Configuracion central en `config/brand-assets.ts`.
- Componente `BrandLogo` para renderizar logo por tono.
- Sincronizacion de favicon con tema en `components/brand/theme-favicon-sync.tsx`.
- Metadata global de favicons en `app/layout.tsx`.

Archivos de referencia:

- `arquitectura11.md`.
- `config/brand-assets.ts`.
- `components/brand/brand-logo.tsx`.
- `components/brand/theme-favicon-sync.tsx`.
- `public/brand/logos/multistock-logo-light.jpg`.
- `public/brand/logos/multistock-logo-dark.jpg`.

### Tema visual

La aplicacion usa `ThemeProvider` con `next-themes`.

Estado actual:

- El tema por defecto es claro.
- `suppressHydrationWarning` esta activo en `html`.
- Existen componentes preparados para modo claro/oscuro.
- El favicon puede ajustarse segun tono.

### Base de datos

Migraciones actuales:

- `supabase/migrations/20260424200000_init_multitenant_core.sql`.
- `supabase/migrations/20260426103000_create_sale_with_items_function.sql`.
- `supabase/migrations/20260427120000_create_audit_logs.sql`.

Tablas principales:

- `profiles`.
- `businesses`.
- `business_users`.
- `categories`.
- `suppliers`.
- `products`.
- `stock_movements`.
- `sales`.
- `sale_items`.
- `stock_alerts`.
- `audit_logs`.

Funciones y helpers:

- `is_business_member`.
- `is_business_admin`.
- `create_sale_with_items`.

Seguridad:

- RLS activo en tablas operativas.
- Politicas por membresia de negocio.
- Auditoria con select/insert restringido a miembros del negocio.
- Server actions resuelven usuario y negocio activo antes de consultar o mutar.

### Validaciones

El proyecto usa Zod para validar entradas.

Validaciones disponibles:

- Auth: login y registro.
- Negocio: onboarding y tipo de rubro.
- Producto: campos comunes, metadata y filtros.
- Categoria.
- Proveedor.
- Movimiento de stock.
- Venta e items.

Reglas relevantes:

- No vender productos inactivos.
- No vender mas que el stock disponible.
- No permitir stock negativo.
- Unidades decimales permitidas: `kg`, `g`, `liter`, `meter`.
- Unidades no decimales requieren cantidades enteras.
- Las operaciones se limitan al `business_id` activo.

### Feature flags

El proyecto ya tiene un archivo de feature flags en `config/feature-flags.ts`.

Flags activas:

- `reports_v1`.
- `exports_csv_v1`.
- `multi_business_switcher_v1`.
- `audit_visible_v1`.

Flags preparadas pero desactivadas:

- `cash_simple_v2`.
- `branches_v2`.
- `cafeteria_v2`.
- `plans_v3`.
- `invitations_v3`.

Estas flags documentan el camino hacia caja simple, sucursales, cafeteria, planes e invitaciones sin activar esas funciones antes de tiempo.

### Documentacion existente

Documentos principales:

- `README.md`: vision original, stack, modelo de datos y roadmap inicial.
- `estado-implementacion-multistock.md`: estado real del MVP y detalle integral.
- `qa-fase9-checklist.md`: checklist de QA del cierre MVP.
- `arquitectura1.md` a `arquitectura11.md`: decisiones de arquitectura por etapa.
- `docs/demo-data.md`: datos o guia para demo.
- `docs/deploy-vercel.md`: despliegue en Vercel.
- `docs/release-checklist.md`: checklist de release.
- `docs/saas-modelo-preparacion.md`: preparacion comercial sin pagos reales.
- `docs/v2-sucursales-cafeteria-caja.md`: diseno futuro para sucursales, cafeteria y caja simple.

### Alcance comercial actual

El proyecto muestra planes orientativos en `/pricing`, pero no tiene cobro real.

Estado:

- Starter aparece como gratis durante validacion.
- Pro y Business figuran como roadmap o "proximamente".
- No hay checkout.
- No hay pasarela de pago.
- No hay suscripciones automaticas.
- No hay facturacion fiscal.

Esto coincide con `docs/saas-modelo-preparacion.md`, que recomienda validar usuarios y propuesta de valor antes de integrar pagos.

### Funcionalidades que el proyecto tiene hoy

Como usuario:

- Ver landing publica.
- Ver funcionalidades.
- Ver precios orientativos.
- Ver demo visual.
- Registrarse.
- Iniciar sesion.
- Crear negocio.
- Elegir rubro.
- Entrar al panel privado.
- Cambiar negocio activo si tiene mas de uno.

Como negocio:

- Gestionar productos.
- Gestionar categorias.
- Gestionar proveedores.
- Controlar inventario.
- Registrar stock inicial.
- Registrar compras, ajustes, mermas y devoluciones.
- Consultar movimientos.
- Registrar ventas.
- Descontar stock por venta.
- Ver ventas y detalle.
- Ver alertas.
- Resolver alertas.
- Ver dashboard.
- Ver reportes simples.
- Exportar CSV.
- Consultar auditoria.

Como verduleria:

- Usar productos perecibles.
- Definir vida util.
- Habilitar venta por peso.
- Registrar merma.
- Vender cantidades decimales.
- Ver metricas vinculadas a perecibles y merma.

Como almacen:

- Marcar productos de alta rotacion.
- Definir margen sugerido.
- Clasificar productos con categoria comercial.
- Priorizar busqueda por codigo de barras y SKU.
- Ver foco de margenes y rotacion.

Como ferreteria:

- Cargar marca, modelo, material, medida y especificaciones tecnicas.
- Buscar por datos tecnicos.
- Diferenciar productos similares.
- Detectar productos con stock sin movimiento reciente.

### Fuera de alcance o pendiente

No implementado aun:

- Caja simple.
- Apertura/cierre de caja.
- Sucursales reales.
- Stock por sucursal.
- Rubro cafeteria.
- Invitaciones de usuarios.
- Roles avanzados visibles desde UI.
- Planes comerciales reales.
- Checkout o pagos.
- Facturacion fiscal.
- Exportacion PDF.
- Reportes avanzados con filtros profundos.
- Impresion de tickets.
- App movil.
- Integraciones externas.
- Scanner real de codigo de barras.

### Estado final

MultiStock esta por encima de un MVP basico de inventario: ya tiene sitio publico, aplicacion privada protegida, modulos operativos, personalizacion por rubro, auditoria, reportes, exportaciones CSV, marca centralizada y una base preparada para evolucion SaaS.

El foco recomendado para el siguiente tramo es validar el uso real con comercios piloto, cerrar QA de flujos criticos y luego decidir si avanzar con caja simple, sucursales, roles/invitaciones o monetizacion.
