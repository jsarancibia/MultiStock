# arquitectura28.md — Bug: productos creados no aparecen en inventario

## Análisis del problema

### Síntoma
Los productos creados desde el formulario **no aparecen en la página de inventario** (`/inventario`).

### Causa raíz: error de comparación del campo `active`

**El servidor espera `"on"` pero el formulario envía `"true"`.**

1. **Formulario** (`components/productos/product-form.tsx`, línea 275):
   ```tsx
   <input type="hidden" name="active" value={initialProduct?.active !== false ? "true" : "false"} />
   ```
   Para creación de productos nuevos (`initialProduct` es `null`), el valor enviado es **`"true"`**.

2. **Server action** (`modules/core/products/actions.ts`, línea 323):
   ```ts
   active: formData.get("active") === "on",
   ```
   Esto compara el valor recibido `"true"` contra `"on"`, dando como resultado **`false`**.

3. **Zod schema** (`lib/validations/product.ts`, línea 20):
   ```ts
   active: z.coerce.boolean().default(true),
   ```
   `.default(true)` **nunca se ejecuta** porque ya recibe el booleano `false` calculado en el paso 2, y `false` es un valor válido para `z.coerce.boolean()`.

4. **Inventario** (`modules/core/inventory/actions.ts`, línea 16):
   ```ts
   .eq("active", true)
   ```
   Solo muestra productos con `active = true`. Como el producto se creó con `active = false`, **no aparece**.

### Alcance del bug

| Server action | Línea | Código actual | ¿Afectado? |
|---|---|---|---|
| `createProductAction` | 323 | `formData.get("active") === "on"` | **SÍ** |
| `updateProductAction` | 416 | `formData.get("active") === "on"` | **SÍ** |
| `quickUpdateProductAction` | 530 | `formData.get("active") === "on" \|\| formData.get("active") === "true"` | **NO** (ya maneja ambos casos) |

### ¿Por qué `quickUpdateProductAction` sí funciona?
Porque ya usa la doble comparación:
```ts
active: formData.get("active") === "on" || formData.get("active") === "true",
```

## Plan de implementación

### FASE 1 — Corregir comparación en `createProductAction`

**Archivo**: `modules/core/products/actions.ts`, línea 323

**Cambio**:
```diff
-    active: formData.get("active") === "on",
+    active: formData.get("active") === "on" || formData.get("active") === "true",
```

### FASE 2 — Corregir comparación en `updateProductAction`

**Archivo**: `modules/core/products/actions.ts`, línea 416

**Cambio**:
```diff
-    active: formData.get("active") === "on",
+    active: formData.get("active") === "on" || formData.get("active") === "true",
```

### FASE 3 — Verificar que no haya más lugares con el mismo patrón erróneo

```bash
rg '=== "on"' --type ts
```

Confirmar que `quickUpdateProductAction` es el único que ya tiene la corrección doble.

### FASE 4 — Build y verificación

- Build exitoso.
- Probar creación de producto → verificar que aparece en inventario.

## Archivos a modificar

| Archivo | Línea | Acción |
|---|---|---|
| `modules/core/products/actions.ts` | 323 | Agregar `\|\| formData.get("active") === "true"` |
| `modules/core/products/actions.ts` | 416 | Agregar `\|\| formData.get("active") === "true"` |

## Lo que NO cambia

- Schema de validación (`productSchema`) — intacto.
- Flujo de stock inicial (`createStockMovement`) — intacto.
- Página de inventario — intacta.
- Modo rápido, edición, confirmación — intactos.
- Cualquier otra funcionalidad.

## Prevención futura

Para evitar este tipo de bugs, se recomienda:
- Usar un helper `parseActiveField(value: FormDataEntryValue | null): boolean` que centralice la lógica de `"on"` / `"true"`.
- Test de integración que verifique que un producto creado aparece en el inventario.

---

## Post-implementación: reparación de productos ya creados

### Síntoma (reportado por el usuario)
Aunque el bug está corregido para productos **nuevos**, los 5 productos creados antes de la corrección ya están en la base de datos con `active = false`. Siguen sin aparecer en inventario.

### Solución: botón de reactivación masiva en la página de inventario

Se agregaron los siguientes componentes:

| Archivo | Acción |
|---|---|
| `modules/core/inventory/actions.ts` | Agregar `countInactiveProducts()` y `reactivateAllInactiveProducts()` |
| `components/inventario/reactivate-products-banner.tsx` | Nuevo — banner con alerta y botón "Reactivar N producto(s)" |
| `app/(app)/inventario/page.tsx` | Integrar banner usando `countInactiveProducts` |

### Comportamiento del banner

1. Al cargar la página de inventario, se consulta cuántos productos inactivos hay (`countInactiveProducts`).
2. Si hay 0 productos inactivos, el banner no se muestra.
3. Si hay 1+, se muestra un banner ámbar con el texto: *"Hay N producto(s) inactivo(s) que deberían estar visibles. Esto ocurrió por un bug al crear productos."*
4. El botón "Reactivar N producto(s)" ejecuta `reactivateAllInactiveProducts` que:
   - Actualiza `active = true` para todos los productos inactivos del negocio.
   - Crea un audit log por cada producto reactivado.
   - Revalida las rutas `/inventario` y `/productos`.
5. Al completarse, el banner cambia a verde con un mensaje de éxito.
