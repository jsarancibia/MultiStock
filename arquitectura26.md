# arquitectura26.md (v2) — Corrección de bugs: submit accidental e integración de pasos

## Análisis de estado actual

### Bug 1 — Productos creados sin hacer clic en "Crear producto"

**Causa raíz**: Comportamiento HTML estándar. En un `<form>` con `<button type="submit">`, **presionar Enter dentro de cualquier input envía el formulario**. Esto pasa incluso estando en los pasos 1, 2 o 3 del wizard, porque los botones submit están en el DOM (aunque ocultos visualmente con CSS `hidden`).

**Ejemplo**: Usuario escribe nombre en paso 1 → presiona Enter → `formAction` se ejecuta → producto se crea (o falla por validación del servidor).

**Solución**: Prevenir el submit con Enter cuando no se está en el último paso. Agregar un manejador `onKeyDown` en el `<form>` que capture Enter y avance al siguiente paso en lugar de submitear.

### Bug 2 — ¿Qué paso de confirmación borrar?

**Análisis**: El usuario menciona "paso 4 confirmacion del producto". Revisando la historia:

| Antes de | Pasos del wizard |
|---|---|
| `arquitectura24` | 1) básicos · 2) precio · 3) rubro · **4) Confirmar** (solo checkbox activo) |
| `arquitectura24` | 1) básicos · 2) precio · 3) venta rápida · **4) Configuración** |
| `arquitectura25` | 1) básicos · 2) precio · 3) venta rápida · 4) configuración · **5) Confirmar (nuevo con resumen)** |
| `arquitectura26` | Igual que arriba (restaurado) |

El viejo paso 4 "Confirmar" (solo checkbox activo) **ya fue eliminado** en `arquitectura24`. No existe más. El paso 5 "Confirmar" actual es el **nuevo bueno** con resumen, checklist y vista previa.

**Conclusión**: No hay nada que borrar. El viejo paso 4 de confirmación ya no existe.

---

## Plan de implementación

### FASE 1 — Prevenir submit accidental con Enter

**Archivo a modificar**: `components/productos/product-form.tsx`

**Qué hacer**: Agregar un manejador `onKeyDown` al `<form>` que:
- Detecte la tecla Enter (`event.key === "Enter"`).
- Si no es el último paso (`currentStep < maxSteps - 1`), prevenga el submit y avance al siguiente paso.
- Si es textarea, permitir Enter normalmente (Shift+Enter para nueva línea).
- Si es el último paso (confirmación), dejar el comportamiento normal de submit.

**Código**:

```tsx
function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
  // Solo interceptar Enter
  if (event.key !== "Enter") return;

  // Permitir Shift+Enter en textareas
  if (event.shiftKey) return;

  const target = event.target as HTMLElement;
  // Si el foco está en un textarea, no interceptar
  if (target.tagName === "TEXTAREA") return;

  // Si no es el último paso, prevenir submit y avanzar
  if (currentStep < maxSteps - 1) {
    event.preventDefault();
    handleNext();
  }
}
```

Y en el `<form>`:

```tsx
<form
  ref={formRef}
  action={formAction}
  className="space-y-6"
  onChange={() => setIsDirty(true)}
  onKeyDown={handleFormKeyDown}
>
```

**Impacto**: 
- En pasos 1-4: Enter avanza al siguiente paso (igual que hacer clic en "Siguiente").
- En paso 5 (confirmar): Enter envía el formulario normalmente.
- En textareas: Enter funciona normalmente (nueva línea).
- No rompe funcionalidad existente.

---

### FASE 2 — Verificar que no hay nada que borrar del paso 4

Confirmación visual de que el wizard actual es correcto:

```
Paso 1 → Datos básicos
Paso 2 → Precio y stock
Paso 3 → Venta rápida
Paso 4 → Configuración del producto (colapsable)
Paso 5 → ✅ Revisión final (resumen, checklist, vista previa, submit)
```

El viejo "Confirmar" paso 4 (solo checkbox activo) ya no existe desde `arquitectura24`.

---

### FASE 3 — Actualizar arquitectura26.md

El documento ya está actualizado con este análisis y plan.

---

### FASE 4 — Verificación y build

- Probar que Enter en paso 1 avance al paso 2 (no submit).
- Probar que Enter en paso 5 sí haga submit.
- Probar que Shift+Enter en textarea funcione normal.
- Probar que clic en "Siguiente" y "Anterior" sigan funcionando.
- Verificar build exitoso.

---

## Resumen de archivos

| Archivo | Acción |
|---|---|
| `components/productos/product-form.tsx` | MODIFICAR — agregar `onKeyDown` handler para prevenir submit con Enter en pasos no finales |

## Lo que NO cambia

- Los pasos del wizard (5 pasos correctos).
- `ProductConfirmSection`, `ProductConfigSection`, etc. — intactos.
- Modo rápido y edición — intactos (el handler detecta `currentStep` que es 0 en quick mode, así que nunca previene submit).
- Schema, actions, nada más.
