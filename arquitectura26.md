# arquitectura26.md (v3) — Eliminación del paso 4 de configuración e integración en confirmación

## Resumen del cambio

Se eliminó el **Paso 4 "Configuración del producto"** como paso independiente del wizard. Ahora los campos de configuración según rubro se muestran directamente en el **Paso 4 "Confirmar"** (antes paso 5), justo antes del resumen de revisión final.

El wizard queda así:

```
Paso 1 → Datos básicos
Paso 2 → Precio y stock
Paso 3 → Venta rápida
Paso 4 → Confirmar (incluye campos de configuración + resumen + checklist + vista previa)
```

## Archivos modificados

### `components/productos/product-form.tsx`

- Se eliminó `"config"` de `wizardSteps` (ahora solo 4 pasos).
- Se eliminó el bloque independiente del Paso 4 que renderizaba `ProductConfigSection`.
- Se movió `ProductConfigSection` dentro del bloque de confirmación (antes paso 5, ahora paso 4).
- Se ajustó `currentStep === 3` para el paso de confirmación.
- Se mantuvo la importación de `ProductConfigSection`.
- Se mantuvo la lógica existente (snapshot, validación, navegación, onKeyDown).

### `components/productos/product-confirm-section.tsx`

- Se eliminó la sección duplicada de "Configuración del producto" del resumen de confirmación, ya que los campos editables de `ProductConfigSection` se muestran justo arriba.
- Se eliminaron las variables `allowsWeightSale`, `isPerishable`, `wasteTracking`, `expirationDays`, `brand`, `model`, `material`, `measure` que ya no se usaban.
- Se eliminó la referencia a `brand` y `measure` en la vista previa de ferretería.
- Se mantuvo el `CheckItem` de "Configuración revisada" en el checklist.

## Lo que NO cambia

- **Lógica de servidor**: `buildMetadataFromFormData`, validaciones, schemas, actions — intactos.
- **Modo rápido**: sigue funcionando igual (sin wizard).
- **Edición de productos**: sigue funcionando igual (muestra todas las secciones).
- **onKeyDown handler**: sigue previniendo submit accidental con Enter en pasos no finales.
- **Snapshot y validación**: el snapshot se captura al entrar al paso de confirmación.
- **Botones de submit**: "Crear producto" y "Guardar y crear otro" se deshabilitan si `snapshotValid` es falso.
