# Arquitectura 5 - Confianza operativa, auditoria y calidad del sistema

Este archivo contiene las fases 13, 14 y 15 de MultiStock. El objetivo es fortalecer la confianza del sistema antes de seguir agregando funcionalidades grandes.

La prioridad es que el inventario sea confiable. Para un comercio, saber quien cambio stock, quien edito precios y quien desactivo productos vale tanto como la funcionalidad misma.

## Principio principal

No agregar modulos nuevos por agregar. Primero asegurar:

- trazabilidad
- estabilidad
- velocidad
- errores claros
- pruebas
- seguridad

---

# Fase 13 - Auditoria temprana del inventario

## Objetivo

Agregar una capa simple de auditoria para registrar acciones sensibles del sistema.

## Resultado esperado

El negocio debe poder saber quien hizo cambios importantes y cuando.

## Acciones a auditar

Inicialmente auditar:

- Creacion de producto.
- Edicion de producto.
- Cambio de precio de costo.
- Cambio de precio de venta.
- Desactivacion de producto.
- Movimiento de stock.
- Venta registrada.
- Alerta resuelta.
- Creacion/edicion de proveedor.

## Tabla sugerida

```sql
audit_logs
```

Campos:

```txt
id uuid primary key
business_id uuid not null
user_id uuid
entity_type text not null
entity_id uuid
action text not null
summary text not null
before_data jsonb
after_data jsonb
metadata jsonb
created_at timestamptz default now()
```

## Valores sugeridos

### entity_type

```txt
product
stock_movement
sale
supplier
category
stock_alert
business
```

### action

```txt
created
updated
deleted
deactivated
stock_changed
price_changed
sale_confirmed
alert_resolved
```

## Reglas

- Todo `audit_log` debe pertenecer a un `business_id`.
- El usuario debe quedar registrado cuando exista.
- No guardar secretos.
- No auditar cada pixel de UI, solo acciones de negocio.
- Mantener un resumen humano en `summary`.
- Guardar `before_data` y `after_data` solo cuando aporte valor.

## Tareas para Cursor

1. Crear migracion de `audit_logs`.
2. Crear tipos en `types/database.ts`.
3. Crear helper server:
   - `lib/audit/create-audit-log.ts`
4. Integrar auditoria en:
   - productos
   - proveedores
   - movimientos
   - ventas
   - alertas
5. Crear pagina de auditoria:
   - `/auditoria`
6. Crear tabla simple de auditoria.
7. Agregar navegacion si el modulo esta habilitado.
8. Filtrar siempre por `business_id`.
9. Agregar RLS.

## Archivos esperados

```txt
supabase/migrations/*_create_audit_logs.sql
lib/audit/create-audit-log.ts
modules/core/audit/actions.ts
app/(app)/auditoria/page.tsx
components/auditoria/audit-table.tsx
types/database.ts
config/navigation.ts
```

## Criterios de aceptacion

- Un cambio de precio queda auditado.
- Una venta queda auditada.
- Un movimiento de stock queda auditado.
- Un producto desactivado queda auditado.
- El usuario solo ve auditoria de su negocio.
- La auditoria no rompe el flujo si falla de forma no critica.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Revisar si `before_data` y `after_data` son suficientes.
- Probar con usuarios distintos cuando existan roles.
- Confirmar que no se guarden datos sensibles.

---

# Fase 14 - Robustez, errores y velocidad percibida

## Objetivo

Hacer que MultiStock se sienta estable incluso cuando algo falla.

## Resultado esperado

El usuario debe recibir mensajes claros, estados de carga y recuperacion simple ante errores comunes.

## Areas a mejorar

- Server actions.
- Formularios.
- Tablas.
- Loaders.
- Empty states.
- Error boundaries.
- Validaciones visibles.
- Navegacion lenta.

## Errores comunes a cubrir

- Producto no encontrado.
- Stock insuficiente.
- Producto inactivo.
- Negocio no encontrado.
- Usuario no autenticado.
- Error de Supabase.
- Error de red.
- Venta fallida.
- Movimiento que dejaria stock negativo.

## Tareas para Cursor

1. Crear componentes de feedback reutilizables:
   - `InlineError`
   - `FormMessage`
   - `PageErrorState`
   - `TableEmptyState`
2. Agregar `error.tsx` en rutas principales:
   - dashboard
   - productos
   - inventario
   - ventas
   - proveedores
   - alertas
3. Mejorar mensajes de server actions.
4. Normalizar formato de errores.
5. Revisar que cada formulario muestre errores de campo.
6. Agregar loading skeletons en rutas pesadas.
7. Revisar tiempos de consultas del dashboard.
8. Evitar consultas duplicadas innecesarias.
9. Mantener UX simple en mobile.

## Archivos esperados

```txt
components/ui/form-message.tsx
components/ui/page-error-state.tsx
components/ui/table-empty-state.tsx
app/(app)/**/error.tsx
app/(app)/**/loading.tsx
modules/core/**/actions.ts
```

## Criterios de aceptacion

- Ningun error critico aparece como stack tecnico al usuario final.
- Las acciones fallidas explican que paso.
- Los loaders son consistentes.
- El usuario puede reintentar o volver.
- El dashboard no se siente bloqueado.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Simular fallos de Supabase.
- Probar conexion lenta.
- Probar formularios con datos invalidos.

---

# Fase 15 - QA, datos demo y preparacion de release

## Objetivo

Preparar MultiStock para una demo real y pruebas con usuarios.

## Resultado esperado

El proyecto debe tener checklist, datos demo y pasos claros para validar antes de desplegar.

## Datos demo

Crear datos realistas para:

### Verduleria

- Banana.
- Manzana.
- Tomate.
- Papa.
- Frutilla.
- Productos por kg y por unidad.
- Productos perecibles.
- Mermas.

### Almacen

- Leche.
- Arroz.
- Aceite.
- Galletitas.
- Bebidas.
- Codigos de barras simulados.
- Alta rotacion.
- Margenes.

### Ferreteria

- Tornillos.
- Cinta metrica.
- Llave francesa.
- Pintura.
- Taladro.
- Marca, medida y material.

## Tareas para Cursor

1. Crear checklist de QA actualizado.
2. Crear guia de datos demo.
3. Crear seed opcional si conviene.
4. Documentar pasos para probar:
   - auth
   - onboarding
   - productos
   - stock
   - ventas
   - alertas
   - dashboard
5. Documentar pasos de deploy en Vercel.
6. Documentar variables necesarias.
7. Revisar `npm run lint`.
8. Revisar `npm run build`.
9. Revisar migraciones necesarias en Supabase.
10. Crear checklist de release.

## Archivos esperados

```txt
qa-fase9-checklist.md
docs/demo-data.md
docs/release-checklist.md
docs/deploy-vercel.md
supabase/seed.sql (opcional)
```

## Criterios de aceptacion

- Una persona puede probar el producto siguiendo el checklist.
- Hay datos demo suficientes para mostrar el sistema.
- Build de produccion pasa.
- El deploy esta documentado.
- Las variables de entorno estan documentadas.

## Manual

Estas tareas debe hacerlas el desarrollador:

- Crear el proyecto en Vercel.
- Configurar variables reales.
- Ejecutar migraciones en Supabase.
- Configurar Auth Redirect URLs.
- Validar en navegador limpio.
