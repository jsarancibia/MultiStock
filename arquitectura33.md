# arquitectura33.md — Cierre del sistema de usuarios, roles y permisos

## Estado pre-ejecución (13 mayo 2026)

Tras revisar el código real contra `SISTEMA-USUARIOS.md` y `arquitectura32.md`, se verificó que:

### ✅ Ya implementado y verificado

| Componente | Archivo(s) | Estado |
|---|---|---|
| F2 — `BusinessRole = "owner" \| "employee"` | `lib/auth/require-business-role.ts` | ✅ |
| F2 — `BusinessRole = "owner" \| "employee"` | `types/database.ts` | ✅ |
| F2 — Migración SQL simplificar roles | `supabase/migrations/20260510140000_simplify_business_roles.sql` | ✅ Creada, NO ejecutada |
| F3 — `updateUserPlan()` solo actualiza `businesses` | `modules/admin/actions.ts` | ✅ |
| F3 — `getAdminDashboard()` cuenta desde `businesses` | `modules/admin/actions.ts` | ✅ |
| F3 — Admin page usa `businessesByPlan` | `app/(app)/admin/page.tsx` | ✅ |
| F3 — `getUsers()` sin `plan` | `modules/admin/actions.ts` | ✅ |
| F3 — `getCurrentProfile()` sin `plan` | `lib/auth/is-admin.ts` | ✅ |
| F3 — `admin-users-table.tsx` sin columna Plan | `components/admin/admin-users-table.tsx` | ✅ |
| F4 — `resolveStockAlertAction` con `requireBusinessRole` | `modules/core/alerts/actions.ts` | ✅ |
| F4 — Migración SQL RLS stock_alerts | `supabase/migrations/20260510150000_restrict_employee_stock_alerts.sql` | ✅ Creada, NO ejecutada |
| F5 — Inventario oculta botón employee | `app/(app)/inventario/page.tsx` | ✅ |
| F6 — Rutas protegidas (owner-only) | 8 páginas verificadas | ✅ |
| F7 — Admin panel (dashboard, usuarios, negocios) | 3 páginas + layout | ✅ |

### 🔴 Pendiente de ejecutar

1. Validar TypeScript (`tsc --noEmit`)
2. Marcar `profiles.plan` como deprecated (ya tiene comentario parcial)
3. Ejecutar migraciones SQL en Supabase
4. Pruebas de regresión
5. Validación final

---

## ▶ ORDEN DE EJECUCIÓN

```
FASE 1 → Validar TypeScript (detectar errores nuevos vs legacy)
FASE 2 → Documentar deprecated profiles.plan
FASE 3 → Ejecutar migraciones SQL
FASE 4 → Pruebas de regresión
FASE 5 → Validación final y resumen
```

---

## FASE 1 — Validar TypeScript

**Comando:** `npx tsc --noEmit`

**OBJETIVO:** Detectar errores reales de TypeScript. Diferenciar errores NUEVOS vs PREEXISTENTES.

**ATENCIÓN:** Si aparece error en `invite-member-form.tsx`, verificar si es legacy o causado por cambios recientes.

### Posibles errores esperados

| Archivo | Posible error | Gravedad |
|---|---|---|
| `invite-member-form.tsx` | `state?.success` — tipo `useActionState` | 🔴 Revisar |
| `user-plan-select.tsx` | No importado (dead code) | 🟢 Bajo |
| Cualquier otro | Depende de compilación | — |

### Entregable

1. Lista de errores encontrados
2. Errores nuevos
3. Errores preexistentes
4. Gravedad
5. Recomendación de solución

---

## FASE 2 — Marcar `profiles.plan` como deprecated

**Archivo:** `supabase/migrations/20260506120000_add_global_roles_and_profile_plan.sql`

**OBJETIVO:** Documentar oficialmente que `profiles.plan` ya NO es fuente de verdad.

**Regla:** NO eliminar columna. NO eliminar migración. NO romper SQL histórico.

La migración ya tiene un comentario de deprecated (líneas 4-6), pero se reforzará con comentarios adicionales.

### Acciones

1. Agregar encabezado deprecated más detallado
2. Documentar cada bloque que involucre `profiles.plan`
3. NO modificar comportamiento

---

## FASE 3 — Ejecutar migraciones SQL

**Orden estricto:**

### 3.1 — `20260510140000_simplify_business_roles.sql`

Migraciones esperadas:
- `admin` → `owner`
- `employee_limited` → `employee`
- `employee_viewer` → `employee`
- `staff` → `employee`

Resultado: CHECK constraint solo permite `owner` y `employee`.

**Validar post-ejecución:**
- ✅ Constraint actualizado
- ✅ Datos migrados correctamente
- ✅ `business_users` consistente
- ✅ Sin datos huérfanos
- ✅ Sin roles inválidos

### 3.2 — `20260510150000_restrict_employee_stock_alerts.sql`

Permisos finales para employee en `stock_alerts`:

| Operación | Employee |
|---|---|
| SELECT | ✅ Ver alertas |
| UPDATE resolved | ✅ Marcar como resuelta |
| INSERT | ❌ NO |
| DELETE | ❌ NO |

Owner tiene acceso completo.

**Validar post-ejecución:**
- ✅ Policies duplicadas eliminadas
- ✅ Sin conflictos RLS
- ✅ Permisos reales correctos

---

## FASE 4 — Pruebas de regresión

### TEST 1 — Employee ventas
- ✅ Crear venta
- ✅ Ver ventas
- ❌ No romper flujo de caja

### TEST 2 — Employee productos
- ❌ No puede crear producto
- ❌ No puede editar producto
- ❌ No puede eliminar producto
- ✅ Botones ocultos en UI
- ✅ `/productos/nuevo` → redirect/bloqueo

### TEST 3 — Employee inventario
- ✅ Ver inventario
- ❌ No registrar movimientos
- ✅ Botón oculto
- ✅ `/inventario/movimientos/nuevo` → bloqueado

### TEST 4 — Employee alertas
- ✅ Ver alertas
- ✅ Resolver alertas
- ❌ Crear alertas
- ❌ Borrar alertas

### TEST 5 — Rutas protegidas (employee)
| Ruta | Resultado esperado |
|---|---|
| `/equipo` | redirect /dashboard |
| `/proveedores` | redirect /dashboard |
| `/auditoria` | redirect /dashboard |
| `/exportaciones` | redirect /dashboard |
| `/reportes` | redirect /dashboard |
| `/admin` | redirect /dashboard |

### TEST 6 — Owner
- ✅ Productos (CRUD completo)
- ✅ Editar productos
- ✅ Inventario
- ✅ Registrar movimientos
- ✅ Proveedores
- ✅ Reportes
- ✅ Auditoría
- ✅ Exportaciones

### TEST 7 — Admin global
- ✅ Dashboard carga
- ✅ Usuarios cargan
- ✅ Negocios cargan
- ✅ Cambio de `subscription_plan`
- ✅ Panel admin operativo
- ❌ NO depende de `profiles.plan`

---

## FASE 5 — Validación final

### Entregable

1. Migraciones ejecutadas
2. Archivos modificados
3. Errores encontrados
4. Errores solucionados
5. Errores legacy
6. Tests aprobados
7. Riesgos restantes
8. Breaking changes
9. Estado final del sistema

### Clasificación

| Color | Significado |
|---|---|
| 🟢 | Listo para producción temprana |
| 🟡 | Listo para beta |
| 🔴 | Requiere correcciones |
