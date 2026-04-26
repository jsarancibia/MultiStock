# Arquitectura 4 - Producto SaaS, UX profesional y experiencia MVP

Este archivo contiene las fases 10, 11 y 12 de MultiStock. El objetivo no es agregar mas modulos operativos, sino hacer que el MVP actual se sienta como un producto SaaS profesional, claro, rapido y confiable.

Antes de empezar este archivo deben estar completas las fases de `arquitectura1.md`, `arquitectura2.md` y `arquitectura3.md`.

## Principio principal

No sumar features grandes. En esta etapa gana calidad:

- Mejor flujo de usuario.
- Mejor UX.
- Mejor velocidad percibida.
- Mejores errores.
- Mejor dashboard.
- Mejor identidad SaaS.
- Mejor presentacion del producto.

## Inspiracion visual

Tomar como referencia productos SaaS con dashboard claro y profesional:

- Sidebar oscura con navegacion limpia.
- Cards ejecutivas arriba.
- Graficos simples.
- Alertas visibles.
- Top productos o resumen por categoria.
- Accesos rapidos a acciones frecuentes.
- Jerarquia visual tipo panel administrativo moderno.

La captura de referencia muestra un panel con:

- Sidebar vertical.
- Resumen ejecutivo.
- Cards de metricas.
- Grafico de tendencia.
- Alertas de stock bajo.
- Top productos.
- Secciones de comparacion mensual.

MultiStock debe tomar esa idea, pero mantener su identidad propia y una experiencia mas limpia, SaaS y minimalista.

---

# Fase 10 - Pulido UX del MVP actual

## Objetivo

Mejorar la experiencia del flujo ya implementado, sin agregar modulos nuevos.

## Resultado esperado

El usuario debe poder recorrer el MVP completo sin friccion: login, onboarding, dashboard, productos, inventario, proveedores, ventas y alertas.

## Alcance

Incluido:

- Revisar textos de interfaz.
- Mejorar estados vacios.
- Mejorar mensajes de error.
- Mejorar loaders.
- Mejorar botones principales.
- Mejorar jerarquia visual.
- Revisar mobile/responsive.
- Revisar accesibilidad basica.
- Reducir dudas en formularios.

No incluido:

- Nuevos rubros.
- Caja.
- Facturacion.
- Reportes avanzados.
- Suscripciones.
- Multi-sucursal.

## Tareas para Cursor

1. Revisar todos los flujos principales:
   - auth
   - onboarding
   - dashboard
   - productos
   - inventario
   - movimientos
   - proveedores
   - ventas
   - alertas
2. Mejorar `EmptyState` para que incluya:
   - titulo claro
   - descripcion breve
   - accion principal cuando corresponda
3. Mejorar loaders de rutas privadas.
4. Agregar mensajes de ayuda en formularios criticos:
   - stock inicial
   - stock minimo
   - merma
   - venta por peso
   - metodo de pago
5. Normalizar etiquetas visibles:
   - `purchase` -> Compra
   - `sale` -> Venta
   - `waste` -> Merma
   - `low_stock` -> Stock bajo
6. Revisar botones CTA por pantalla.
7. Revisar tablas en mobile.
8. Agregar formato consistente de moneda y cantidades.
9. Mejorar feedback despues de acciones.
10. Revisar que no haya pantallas sin accion clara.

## Archivos esperados

```txt
components/ui/empty-state.tsx
components/layout/app-sidebar.tsx
components/layout/app-header.tsx
components/dashboard/stat-card.tsx
components/inventario/
components/productos/
components/ventas/
components/alertas/
app/(app)/loading.tsx
lib/utils.ts
```

## Criterios de aceptacion

- El MVP se puede usar sin leer documentacion.
- Cada pantalla tiene una accion principal clara.
- Las tablas no se rompen en pantallas pequenas.
- Los errores explican que hacer.
- Los estados vacios invitan a avanzar.
- El usuario entiende la diferencia entre producto, stock, movimiento y venta.

## Manual

Estas tareas puede tener que revisarlas el desarrollador:

- Probar el flujo completo en desktop.
- Probar el flujo completo en mobile.
- Crear datos de prueba para cada rubro.
- Ver si los textos son naturales para usuarios reales.

---

# Fase 11 - Identidad SaaS y pantallas publicas de producto

## Objetivo

Convertir MultiStock en algo que se sienta como una startup SaaS real, no solo una app interna.

## Resultado esperado

Debe existir una capa publica de producto que explique que es MultiStock, para quien sirve y por que usarlo.

## Pantallas publicas

Crear:

```txt
/
/features
/pricing
/demo
```

## Alcance

Incluido:

- Landing publica.
- Pagina de features.
- Pricing simple aunque sea referencial.
- Pagina demo con screenshots o placeholders.
- CTA hacia registro/login.
- Uso de identidad visual de MultiStock.

No incluido:

- Pagos reales.
- Suscripciones reales.
- Checkout.
- CMS.
- Blog.

## Contenido sugerido

### Landing

- Hero claro:
  - "Controla stock, ventas y alertas sin complicarte."
- Subtitulo:
  - Para verdulerias, almacenes y ferreterias.
- CTA:
  - Crear cuenta
  - Ver demo
- Seccion de beneficios:
  - Inventario simple
  - Ventas con descuento automatico
  - Alertas de stock
  - Dashboard por rubro
- Screenshot o mockup del dashboard.

### Features

Mostrar funcionalidades actuales:

- Productos.
- Inventario.
- Movimientos.
- Ventas basicas.
- Proveedores.
- Alertas.
- Dashboard.
- Personalizacion por rubro.

### Pricing

Pricing falso/referencial para validar propuesta:

```txt
Starter - Para un negocio pequeno
Pro - Para comercios en crecimiento
Business - Para multiples usuarios o sucursales futuras
```

Marcar claramente que los planes son orientativos si todavia no hay pagos reales.

### Demo

Debe mostrar una experiencia tipo producto:

- Imagen del dashboard.
- Imagen de productos.
- Imagen de nueva venta.
- Imagen de alertas.
- Texto breve explicando el flujo.

## Estilo visual

Inspiracion:

- Stripe.
- Vercel.
- Linear.
- Supabase.
- Notion.

Debe sentirse:

- Profesional.
- Minimalista.
- SaaS.
- Confiable.
- Rapido de entender.

## Archivos esperados

```txt
app/page.tsx
app/features/page.tsx
app/pricing/page.tsx
app/demo/page.tsx
components/marketing/
assets/logo-system/
```

## Criterios de aceptacion

- Un visitante entiende que hace MultiStock en menos de 10 segundos.
- La landing tiene CTA hacia registro.
- La identidad visual es coherente con el logo.
- La app se siente como producto, no como prototipo.
- Pricing no promete pagos reales si no estan implementados.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Elegir screenshots reales.
- Revisar copy final.
- Decidir si mostrar precios o "Proximamente".

---

# Fase 12 - Dashboard ejecutivo profesional

## Objetivo

Elevar el dashboard actual para que sea el centro visual del negocio, inspirado en la captura de referencia pero adaptado a MultiStock.

## Resultado esperado

El dashboard debe mostrar un resumen ejecutivo claro y util para el comercio.

## Layout sugerido

```txt
Resumen Ejecutivo

[Ventas hoy] [Productos activos] [Alertas pendientes] [Capital estimado]

[Tendencia de ventas / movimientos]
[Top productos / categorias]

[Alertas de stock bajo]
[Resumen por rubro]
```

## Componentes a crear o mejorar

- Cards ejecutivas.
- Grafico de tendencia simple.
- Panel de top productos o categorias.
- Panel de alertas criticas.
- Panel de actividad reciente.
- Accesos rapidos:
  - Nuevo producto
  - Registrar movimiento
  - Nueva venta
  - Ver alertas

## Metricas comunes

- Ventas del dia.
- Productos activos.
- Productos bajo stock.
- Alertas pendientes.
- Movimientos recientes.
- Capital estimado en inventario:
  - suma de `current_stock * cost_price`

## Metricas por rubro

### Verduleria

- Merma reciente.
- Productos perecibles.
- Productos vendidos por peso.

### Almacen

- Productos de alta rotacion.
- Margen promedio.
- Productos mas vendidos.

### Ferreteria

- Productos tecnicos bajo stock.
- Productos sin movimiento reciente.
- Categoria principal.

## Reglas de implementacion

- Usar datos reales del negocio activo.
- Mantener filtros por `business_id`.
- No agregar reportes avanzados todavia.
- Si se usan graficos, mantenerlos simples.
- No saturar la pantalla.
- Priorizar lectura rapida.

## Archivos esperados

```txt
app/(app)/dashboard/page.tsx
components/dashboard/
lib/business/dashboard-metrics.ts
modules/verduleria/dashboard-cards.tsx
modules/almacen/dashboard-cards.tsx
modules/ferreteria/dashboard-cards.tsx
```

## Criterios de aceptacion

- El usuario ve el estado del negocio de un vistazo.
- Hay acceso rapido a las acciones mas usadas.
- Las alertas criticas tienen presencia visual.
- El dashboard se ve profesional en desktop.
- El dashboard sigue siendo usable en mobile.

## Manual

Estas tareas puede tener que revisarlas el desarrollador:

- Validar que las metricas sean utiles con datos reales.
- Comparar visualmente con dashboards SaaS modernos.
- Confirmar que no haya consultas lentas.
