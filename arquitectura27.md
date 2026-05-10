# arquitectura27.md — Ocultar metadata raw y agregar botón volver en detalle de producto

## Análisis

La página de detalle de producto (`app/(app)/productos/[id]/page.tsx`) actualmente:

1. **Muestra "Metadata por rubro"** como un `<details>` expandible con el JSON crudo de `product.metadata`. El usuario considera que esto **no aporta nada** visualmente y debe ocultarse.
2. **No tiene botón "Volver"** para regresar a la lista de productos. Solo tiene botones "Editar" y "Desactivar".

## Plan de implementación

### FASE 1 — Ocultar metadata por rubro

**Archivo**: `app/(app)/productos/[id]/page.tsx`

**Qué hacer**: Eliminar el bloque `<details>` que muestra `JSON.stringify(product.metadata)`.

La metadata de `fast_rotation` y `pinned` ya se refleja visualmente en:
- El formulario de creación/edición (sección de venta rápida con switches).
- La tabla de productos (íconos/colores si aplica).

No hay pérdida de funcionalidad porque esta metadata se usa internamente, no necesita mostrarse como JSON crudo al usuario.

### FASE 2 — Agregar navegación con botón volver

**Archivo**: `app/(app)/productos/[id]/page.tsx`

**Qué hacer**: Agregar `PageNavigation` con `backHref="/productos"` en la parte superior de la página, siguiendo el patrón usado en `product-form.tsx`, `stock-movement-form.tsx`, etc.

Esto implica:
- Convertir la página a cliente componente (`"use client"`).
- Importar `PageNavigation` desde `@/components/ui/page-navigation`.
- Reemplazar `PageHeader` por la navegación + título.

### FASE 3 — Verificación y build

- Verificar que la página carga correctamente.
- Verificar que el botón "Volver" navega a `/productos`.
- Verificar que la metadata ya no se muestra como JSON.
- Build exitoso.

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `app/(app)/productos/[id]/page.tsx` | MODIFICAR — eliminar metadata raw, agregar navegación con volver |

## Lo que NO cambia

- Funcionalidad de los botones "Editar" y "Desactivar" se mantiene intacta.
- Ruta y parámetros de la página no cambian.
- No se afectan server actions, schemas, ni otros componentes.
