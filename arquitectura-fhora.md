# ⏰ Diagnóstico y solución: Formato de hora en MultiStock

## Síntomas

- Una venta registrada a las **07:26 CLT** (Chile, invierno) se muestra como **11:05:33**.
- Ocurre en todas las pantallas que usan `formatSystemDateTime()` (ventas, alertas, movimientos, dashboard, auditoría).

---

## 1) Cómo se almacenan las fechas

**Supabase / PostgreSQL**
- Todas las columnas `created_at` son `timestamptz` (timestamp with time zone).
- PostgreSQL guarda internamente en **UTC**.
- Al leer, Supabase devuelve strings ISO 8601 con offset:  
  `2026-05-09T11:05:33.123456+00:00` (UTC).

**Migración `20260424200000_init_multitenant_core.sql`**
- `public.sales.created_at` → `timestamptz not null default now()`
- `public.stock_alerts.created_at` → `timestamptz not null default now()`
- Ídem para: `products`, `stock_movements`, `audit_logs`, `categories`, `suppliers`.

**RPC `create_sale_with_items`**
- Hace `insert into public.sales (...) values (...)` sin explicit timezone → usa `now()` que es UTC en el servidor PostgreSQL.

✅ **El almacenamiento es correcto.** El problema está en la **lectura + formateo**.

---

## 2) Cómo se leen y formatean

Todas las fechas pasan por este camino:

```
Supabase (timestamptz UTC) → JSON string ISO 8601 → new Date(iso) → toLocaleString("es-CL", { hour12: false })
```

### Server Components vs Client Components

| Tipo de componente | ¿Dónde se ejecuta `toLocaleString`? | Timezone que usa |
|---|---|---|
| **Server Component** (mayoría) | Node.js (servidor) | `TZ` del servidor (por defecto UTC en Vercel/Railway) |
| **Client Component** (`"use client"`) | Navegador | Timezone del usuario (Chile) |

🔥 **Bug principal**: los Server Components NO tienen acceso a la timezone del navegador.  
→ `new Date("2026-05-09T11:05:33Z").toLocaleString("es-CL")` en Node.js con `TZ=UTC` produce:
```
09/05/2026 11:05:33
```
pero la hora real en Chile (UTC-4) es:
```
09/05/2026 07:05:33
```

### Componentes afectados

| Archivo | Línea | ¿Server o Client? |
|---|---|---|
| `lib/utils.ts` — `formatSystemDateTime()` | 55-66 | Ambigua (se llama desde ambos) |
| `app/(app)/admin/page.tsx` — `formatDate()` | 6-8 | Server |
| `components/admin/admin-businesses-table.tsx` — `formatDate()` | 16-18 | Server |
| `lib/business/dashboard-metrics.ts` — `toLocaleDateString` | 148 | Server (solo fecha, no hora) |
| `components/ventas/sales-table.tsx` | 2 | **Server** |
| `app/(app)/ventas/[id]/page.tsx` | 6, 31 | **Server** |
| `components/alertas/stock-alerts-list.tsx` | 4, 54 | Server |
| `components/inventario/movements-table.tsx` | 4, 54 | Server |
| `components/auditoria/audit-table.tsx` | 2, 54 | Server |
| `components/dashboard/recent-activity.tsx` | 5, 29, 52 | Server |
| `components/dashboard/alert-panel.tsx` | 3, 42 | Server |
| `components/admin/admin-users-table.tsx` | 1, 19-21 | Server |

---

## 3) Opciones de solución

### ✅ Opción recomendada: Agregar `timeZone: "America/Santiago"` al formateo

`toLocaleString` y `Intl.DateTimeFormat` aceptan el parámetro `timeZone` que funciona **tanto en servidor como en cliente** porque es parte del estándar ECMA-402.

```js
// Antes (BUG: usa UTC en servidor)
date.toLocaleString("es-CL", { hour12: false, ... })

// Después (CORRECTO: Chile)
date.toLocaleString("es-CL", {
  timeZone: "America/Santiago",
  hour12: false,
  ...
})
```

**Ventajas:**
- Funciona en Server Components y Client Components por igual.
- "America/Santiago" maneja automáticamente el cambio UTC-3 / UTC-4 (horario de verano/invierno).
- No requiere migración de datos ni cambios en Supabase.
- No requiere mover componentes al cliente.

**Desventajas:**
- No escala a multi-país (por ahora el proyecto solo apunta a Chile).
- `timeZone` no está disponible en entornos JS muy antiguos (no relevante aquí).

### ❌ Opción descartada: Mover todo al cliente

- Forzaría a convertir todos los componentes de tabla a `"use client"`.
- Rompe la arquitectura Server Components.
- Más bundle JS, peor rendimiento.

### ❌ Opción descartada: Variable de entorno `TZ`

- Configurar `TZ=America/Santiago` en el servidor.
- Funciona para `new Date().toLocaleString()`.
- **Pero**: `Intl.DateTimeFormat` (que usa `toLocaleString` por debajo) no siempre lo respeta.
- Frágil: si cambia el entorno de despliegue, se pierde.

### ❌ Opción descartada: Enviar timezone desde el cliente

- Requeriría cookies o headers de timezone.
- Complejidad innecesaria para un proyecto monotimezone.

---

## 4) Archivos a modificar

### A) `lib/utils.ts` — función `formatSystemDateTime` (CRÍTICO)

Agregar `timeZone: "America/Santiago"` :

```typescript
export function formatSystemDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
```

Esto corrige automáticamente **todos** los componentes que ya usan `formatSystemDateTime`:
- `sales-table.tsx` ✅
- `ventas/[id]/page.tsx` ✅
- `stock-alerts-list.tsx` ✅
- `movements-table.tsx` ✅
- `audit-table.tsx` ✅
- `recent-activity.tsx` ✅
- `alert-panel.tsx` ✅
- `admin-users-table.tsx` (usa `formatSystemDateTime` internamente) ✅

### B) `app/(app)/admin/page.tsx` — función `formatDate` local

Reemplazar:

```typescript
function formatDate(value: string) {
  return new Date(value).toLocaleString("es-CL");
}
```

Por:

```typescript
import { formatSystemDateTime } from "@/lib/utils";

// ... o inline:
function formatDate(value: string) {
  return formatSystemDateTime(value);
}
```

O mejor, importar y usar `formatSystemDateTime` directamente.

### C) `components/admin/admin-businesses-table.tsx` — función `formatDate` local

Reemplazar:

```typescript
function formatDate(value: string) {
  return new Date(value).toLocaleString("es-CL");
}
```

Por:

```typescript
import { formatSystemDateTime } from "@/lib/utils";

function formatDate(value: string) {
  return formatSystemDateTime(value);
}
```

### D) `lib/business/dashboard-metrics.ts` — opcional (solo etiquetas de fecha)

Línea 148:
```typescript
const label = d.toLocaleDateString(APP_LOCALE, { weekday: "short", day: "numeric" });
```

Este caso muestra solo **día de la semana + número** (ej: "sáb 9"), no la hora.  
Pero si `d` se construye con `new Date()` y el servidor está en UTC, podría mostrar el día incorrecto cerca de la medianoche.

**Corrección opcional pero recomendada:**

```typescript
const label = d.toLocaleDateString(APP_LOCALE, {
  timeZone: "America/Santiago",
  weekday: "short",
  day: "numeric",
});
```

---

## 5) Orden de implementación

| Prioridad | Archivo | Cambio | Riesgo |
|---|---|---|---|
| 🔴 1 | `lib/utils.ts` | Agregar `timeZone: "America/Santiago"` en `formatSystemDateTime` | ✅ Bajo (solo 1 línea) |
| 🟡 2 | `app/(app)/admin/page.tsx` | Reemplazar `formatDate` por `formatSystemDateTime` | ✅ Bajo |
| 🟡 3 | `components/admin/admin-businesses-table.tsx` | Reemplazar `formatDate` por `formatSystemDateTime` | ✅ Bajo |
| 🟢 4 | `lib/business/dashboard-metrics.ts` | Agregar `timeZone: "America/Santiago"` en `toLocaleDateString` | ✅ Bajo |

**Total: 4 archivos, ~6 líneas modificadas.** Sin migraciones, sin refactors, sin cambios de arquitectura.

---

## 6) Post-implementación — verificación

- [ ] Build `npm run build` exitoso
- [ ] Dashboard muestra fechas correctas (ej: 07:26 y no 11:05)
- [ ] Tabla de ventas con hora Chile (24h)
- [ ] Alerta de stock con hora Chile
- [ ] Movimientos de stock con hora Chile
- [ ] Auditoría con hora Chile
- [ ] Admin panel con hora Chile
- [ ] Admin usuarios con hora Chile
- [ ] Admin negocios con hora Chile
- [ ] Etiquetas de días en tendencia correctas (ej: "vie 8" no "sáb 9")

---

## 7) Notas técnicas

- `"America/Santiago"` es la timezone IANA oficial para Chile Continental.
- Horario de verano: UTC-3 (sep → mar). Horario de invierno: UTC-4 (mar → sep).
- `Intl.DateTimeFormat` con `timeZone` está soportado en Node.js 16+ (el proyecto usa Node.js 20+).
- No confundir con `"Chile/Continental"` (link simbólico obsoleto, aunque funciona).
- Si en el futuro se soportan múltiples países, la timezone debería ser un campo configurable por negocio en tabla `businesses`.
