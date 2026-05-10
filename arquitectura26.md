# arquitectura26.md — Mejoras en modo de carga y limpieza de confirmación

## Análisis de estado actual

### Cambio 1 — Checkbox feo en modo rápido

En `components/productos/product-form.tsx`, líneas 184-194:

```tsx
<label className="flex items-center gap-2 text-sm text-foreground">
  <input
    type="checkbox"
    checked={quickMode}
    onChange={(event) => {
      setQuickMode(event.target.checked);
      setCurrentStep(0);
    }}
  />
  Rápido
</label>
```

Es un `<input type="checkbox">` nativo, sin estilizar. El proyecto ya tiene el componente `ToggleSwitch` en `components/ui/toggle-switch.tsx`, pero `ToggleSwitch` está diseñado con un layout horizontal (label a la izquierda, switch a la derecha con fondo de card). Para este caso, el checkbox "Rápido" está dentro de un contenedor flex con el título "Modo de carga" al lado izquierdo.

Se necesita un toggle más compacto, alineado horizontalmente con solo la etiqueta y el switch.

### Cambio 2 — Paso de confirmación en wizard

En `product-form.tsx`:
- `wizardSteps` tiene 5 pasos, el último es "Confirmar".
- `formRef` se usa para capturar `confirmSnapshot` al entrar al paso 5.
- `snapshotValid` valida el snapshot antes de habilitar el botón submit.
- Todo el bloque del paso 5 y su lógica asociada.

El usuario dice que en "creación lenta" (modo avanzado), el paso 4 de confirmación no sirve. **Aclaración**: El paso 5 (confirmar) es el que hay que eliminar. El wizard quedará con 4 pasos: básicos → precio → venta rápida → configuración. El submit se hará directamente desde el paso 4.

---

## Plan de implementación

---

### FASE 1 — Reemplazar checkbox por ToggleSwitch en modo rápido

**Archivo a modificar**: `components/productos/product-form.tsx`

**Qué hacer**: Reemplazar el `<label>` con `<input type="checkbox">` por el componente `ToggleSwitch` con las props adecuadas. El ToggleSwitch se usará sin `helpText` para un diseño más compacto.

**Código actual** (a reemplazar):

```tsx
<label className="flex items-center gap-2 text-sm text-foreground">
  <input
    type="checkbox"
    checked={quickMode}
    onChange={(event) => {
      setQuickMode(event.target.checked);
      setCurrentStep(0);
    }}
  />
  Rápido
</label>
```

**Código nuevo**:

```tsx
<ToggleSwitch
  name=""
  label="Rápido"
  defaultChecked={quickMode}
  onChange={(checked) => {
    setQuickMode(checked);
    setCurrentStep(0);
  }}
/>
```

**Problema**: El `ToggleSwitch` actual no soporta `onChange` ni `checked` controlado — solo `defaultChecked`. Necesitamos agregar estas props opcionales.

**Solución**: Modificar `ToggleSwitch` para soportar modo controlado (`checked` + `onChange`). Si se pasa `checked` (no undefined), el componente es controlado y usa `checked`/`onChange`; si no, usa `defaultChecked` como hasta ahora.

**Props nuevas a agregar**:

```typescript
type ToggleSwitchProps = {
  name: string;
  label: string;
  helpText?: string;
  defaultChecked?: boolean;
  checked?: boolean;       // nueva
  onChange?: (checked: boolean) => void;  // nueva
};
```

**Lógica**:
- Si `checked` está definido, usar `checked={checked}` y llamar `onChange(e.target.checked)` en el cambio.
- Si no, usar `defaultChecked={defaultChecked}` como antes.

---

### FASE 2 — Eliminar paso de confirmación del wizard

**Archivo a modificar**: `components/productos/product-form.tsx`

**Qué hacer**:

1. **Reducir wizardSteps** de 5 a 4 (quitar paso "Confirmar").

2. **Eliminar `formRef`** y su importación de `useRef` (si no se usa en otro lugar). El `formRef` se usaba para capturar el snapshot.

3. **Eliminar `confirmSnapshot`** state.

4. **Eliminar `snapshotValid`** memo.

5. **Eliminar `isLastStep`** (si ya no se usa).

6. **Eliminar el bloque del paso 5** completo (confirmación).

7. **Eliminar la importación de `ProductConfirmSection`**.

8. **Simplificar la navegación**: en el último paso (ahora paso 4), mostrar directamente los botones de submit sin validación de snapshot. Los botones submit se habilitan siempre (el server valida igual).

9. **Ajustar `goToStep`** para que ya no capture snapshot.

**Impacto**: `maxSteps` pasa de 5 a 4. El flujo ahora es: básicos → precio → venta rápida → configuración → [submit].

---

### FASE 3 — Limpiar imports no utilizados

**Archivo a modificar**: `components/productos/product-form.tsx`

- Remover `useMemo` si ya no se usa `snapshotValid`.
- Remover `ProductConfirmSection` del import.
- El `formRef` ya no se necesita.

---

### FASE 4 — Verificación y build

- Ejecutar `npx next build` para verificar que no hay errores.
- Verificar que modo rápido funcione con el nuevo toggle.
- Verificar que el wizard avanzado tenga 4 pasos y termine en submit directo.
- Verificar que edición de producto no se vea afectada.

---

## Resumen de archivos

| Archivo | Acción |
|---|---|
| `components/ui/toggle-switch.tsx` | MODIFICAR — agregar props `checked` y `onChange` para modo controlado |
| `components/productos/product-form.tsx` | MODIFICAR — reemplazar checkbox por ToggleSwitch, eliminar paso confirmación, limpiar imports |

## Lo que NO cambia

- `ProductConfirmSection` — el componente se mantiene por si se reutiliza en el futuro, pero ya no se importa en ProductForm.
- Schema de validación, server actions, resto de secciones del formulario — intactos.
- Edición de producto — intacta (nunca tenía paso de confirmación).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El ToggleSwitch controlado podría no sincronizarse bien con el estado | Se implementa con `useState`/`checked`/`onChange` siguiendo el patrón estándar de React |
| Al eliminar el paso de confirmación, el usuario pierde validación previa al submit | El servidor valida igual; el formulario muestra errores vía `FormMessage` |
