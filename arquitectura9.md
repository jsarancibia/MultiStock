# Arquitectura 9 - Roadmap de implementacion UI simple

Este documento convierte la direccion visual y los flujos simples en un plan ejecutable.

Objetivo:

```txt
Mejorar la UI sin reescribir el producto completo.
Cada fase debe ser pequeña, verificable y reversible.
```

---

# Fase 25 - App shell visual profesional

## Objetivo

Actualizar la estructura visual principal: sidebar, header, fondo, tarjetas y espaciados.

## Tareas

1. Crear `PageSurface` para fondo y ancho consistente.
2. Revisar `AppSidebar` para estilo oscuro profesional.
3. Revisar `AppHeader` para negocio activo, usuario y acciones.
4. Unificar estilos de tarjetas.
5. Ajustar dashboard para primera impresion visual.

## Archivos esperados

```txt
components/layout/app-sidebar.tsx
components/layout/app-header.tsx
components/ui/page-surface.tsx
components/ui/metric-card.tsx
app/(app)/dashboard/page.tsx
```

## Criterios de aceptacion

- La app se ve mas cercana a un SaaS moderno.
- La navegacion principal es clara.
- No cambia la logica de negocio.
- Build y lint pasan.

---

# Fase 26 - Formularios simples por niveles

## Objetivo

Simplificar formularios frecuentes, especialmente productos.

## Tareas

1. Dividir el formulario de producto en secciones.
2. Crear modo rapido para producto simple.
3. Mover campos avanzados a una seccion plegable.
4. Agregar resumen antes de guardar si el formulario queda largo.
5. Permitir "guardar y crear otro".

## Archivos esperados

```txt
components/productos/product-form.tsx
components/productos/product-basic-section.tsx
components/productos/product-pricing-section.tsx
components/productos/product-business-fields.tsx
modules/core/products/actions.ts
```

## Criterios de aceptacion

- Producto simple: nombre, precio y stock inicial.
- Producto completo: sigue soportando campos actuales.
- No se pierde personalizacion por rubro.
- Errores aparecen cerca del campo.

---

# Fase 27 - Venta rapida estilo punto de venta

## Objetivo

Optimizar la pantalla de nueva venta para uso real en mostrador.

## Tareas

1. Dejar buscador enfocado siempre que sea posible.
2. Mejorar layout de dos columnas en desktop.
3. Dejar total fijo o muy visible.
4. Agregar feedback visual al agregar producto.
5. Mantener compatibilidad mobile.

## Archivos esperados

```txt
app/(app)/ventas/nueva/page.tsx
components/ventas/sale-form.tsx
components/ventas/product-search.tsx
components/ventas/sale-items-table.tsx
components/ventas/sale-summary.tsx
```

## Criterios de aceptacion

- Venta simple en menos de 30 segundos.
- Scanner USB funciona sin configuracion extra.
- El carrito no se pierde por errores.
- El total se entiende al instante.

---

# Fase 28 - Dashboard accionable

## Objetivo

Hacer que el dashboard no solo informe, sino que sugiera acciones.

## Tareas

1. Reordenar cards por prioridad:
   - ventas
   - stock
   - alertas
   - actividad
2. Agregar tareas sugeridas:
   - cargar producto
   - revisar bajo stock
   - registrar compra
   - ver reportes
3. Mejorar visualizacion de progreso:
   - productos activos
   - stock saludable
   - ventas del periodo
4. Agregar accesos rapidos visibles.

## Archivos esperados

```txt
app/(app)/dashboard/page.tsx
components/dashboard/dashboard-quick-actions.tsx
components/dashboard/task-list-card.tsx
components/dashboard/low-stock-panel.tsx
components/dashboard/recent-activity.tsx
```

## Criterios de aceptacion

- El usuario sabe que hacer al entrar.
- Las alertas criticas no quedan escondidas.
- Las metricas principales son faciles de leer.

---

# Fase 29 - Mobile y accesibilidad basica

## Objetivo

Garantizar que las pantallas principales funcionen bien desde celular.

## Tareas

1. Revisar dashboard mobile.
2. Revisar nueva venta mobile.
3. Revisar formularios largos.
4. Asegurar contraste suficiente.
5. Asegurar labels visibles.
6. Revisar foco de teclado.

## Criterios de aceptacion

- No hay desbordes horizontales innecesarios.
- Los botones principales se pueden tocar comodamente.
- Inputs tienen labels y ayudas claras.
- El orden de tabulacion es razonable.

---

# Reglas de implementacion

- No cambiar base de datos por cambios visuales.
- No mezclar rediseño UI con nuevas funcionalidades grandes.
- Mantener cada fase en commits pequeños.
- Validar con `npm run lint` y `npm run build`.
- Si una pantalla queda mas compleja, dividirla en componentes.
- Priorizar claridad sobre decoracion.
