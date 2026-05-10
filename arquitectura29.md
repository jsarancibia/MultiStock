# arquitectura29.md — Bug: edición inline de productos no funciona

## Análisis

### Síntoma
Al hacer clic en "Editar" en la tabla de productos, el inline editor se muestra con los 4 campos (Proveedor, Estado, Precio venta, Precio costo), pero al guardar **los cambios no se reflejan en la tabla**.

### Causas raíz (2 bugs)

#### Bug 1 — Falta `revalidatePath` en `quickUpdateProductAction`

**Archivo**: `modules/core/products/actions.ts`

El server action `quickUpdateProductAction` actualiza la base de datos correctamente, pero **nunca llama a `revalidatePath("/productos")`**. Esto significa que la página de productos (que es un Server Component con datos cacheados) **sigue mostrando los valores viejos** después del inline edit.

```ts
// Actual: falta revalidation
return { message: "Producto actualizado.", success: true };
```

#### Bug 2 — El cliente no refresca los datos después de guardar

**Archivo**: `components/productos/inline-product-editor.tsx`

Cuando `onSaved()` se ejecuta, solo oculta el editor (`setEditingId(null)`), pero **no refresca los datos del servidor**:

```tsx
if (success) {
    queueMicrotask(() => onSaved());
}
```

En `ProductsTable`, `onSaved` hace `setEditingId(null)`, lo que vuelve a mostrar la fila con los datos **viejos** (los que estaban en el server component al cargar la página).

### ¿Por qué solo se ven 4 campos?

El `InlineProductEditor` ya tiene exactamente 4 campos:
1. **Proveedor** (`supplierId`) — select
2. **Estado** (`active`) — select (Activo/Inactivo)
3. **Precio venta** (`salePrice`) — input numérico
4. **Precio costo** (`costPrice`) — input numérico

Los 4 campos están funcionando en el sentido de que el formulario se muestra y los datos iniciales se cargan correctamente. El problema es que los cambios no persisten visualmente en la tabla.

## Plan de implementación

### FASE 1 — Agregar `revalidatePath` en `quickUpdateProductAction`

**Archivo**: `modules/core/products/actions.ts`

1. Agregar import de `revalidatePath`:
   ```ts
   import { redirect } from "next/navigation";
   ```

2. Agregar `revalidatePath("/productos")` antes del return:
   ```ts
   revalidatePath("/productos");
   return { message: "Producto actualizado.", success: true };
   ```

### FASE 2 — Refrescar datos del cliente después de guardar

**Archivo**: `components/productos/inline-product-editor.tsx`

Agregar `useRouter` y llamar a `router.refresh()` cuando `success` es `true`:

```tsx
import { useRouter } from "next/navigation";
// ...
const router = useRouter();
// ...
if (success) {
    queueMicrotask(() => {
        onSaved();
        router.refresh();
    });
}
```

### FASE 3 — Verificar ruta de importación

Asegurarse que `revalidatePath` esté importado desde `next/cache` en `modules/core/products/actions.ts`.

### FASE 4 — Build y verificación

- Build exitoso.
- Probar edición inline de cada campo individualmente.
- Probar edición de múltiples campos a la vez.
- Verificar que los cambios persisten al recargar la página.

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `modules/core/products/actions.ts` | Agregar `revalidatePath` import y llamada |
| `components/productos/inline-product-editor.tsx` | Agregar `router.refresh()` después de guardar |

## Lo que NO cambia

- Schema de validación (`quickProductUpdateSchema`) — intacto.
- Los 4 campos del inline editor — intactos.
- Server action `quickUpdateProductAction` — solo se agrega revalidation, la lógica de negocio no cambia.
- Botones "Editar", "Cancelar", "Guardar" — intactos.
- Cualquier otra funcionalidad.
