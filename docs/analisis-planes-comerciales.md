# Análisis Completo de Planes Comerciales — MultiStock

> **Fecha:** 2026-05-14
> **Basado en:** Código real del proyecto (commit `2ef7374`)
> **Propósito:** Definir planes de pricing, límites y funcionalidades por plan con datos reales del sistema

---

## Índice

1. [Fase 1 — Inventario Total de Funcionalidades](#fase-1--inventario-total-de-funcionalidades)
2. [Fase 2 — Mapeo de Valor Real](#fase-2--mapeo-de-valor-real)
3. [Fase 3 — Funciones Gancho](#fase-3--funciones-gancho)
4. [Fase 4 — Limitaciones Inteligentes](#fase-4--limitaciones-inteligentes)
5. [Fase 5 — Análisis de Negocios Reales](#fase-5--análisis-de-negocios-reales)
6. [Fase 6 — Propuesta de Planes](#fase-6--propuesta-de-planes)
7. [Fase 7 — Implementación Técnica](#fase-7--implementación-técnica)
8. [Conclusión Final](#conclusión-final)

---

# Fase 1 — Inventario Total de Funcionalidades

## 1. Dashboard (`/dashboard`)

### Funciones existentes

-   **Métricas principales**: Ventas hoy (cantidad + monto), ventas 7 días, productos activos, alertas pendientes
-   **Métricas financieras**: Capital en inventario (Σ stock × costo), productos bajo mínimo, movimientos 7 días, % stock saludable
-   **Gráfico de tendencia**: Barras apiladas ventas + movimientos últimos 7 días
-   **Top productos**: Más vendidos por facturación (30 días)
-   **Top categorías**: Categorías con más productos activos
-   **Stock crítico**: Productos más lejos del mínimo (top 6)
-   **Alertas de stock**: Alertas activas sin resolver (top 5)
-   **Actividad reciente**: Combinación ventas + movimientos (últimos 8 eventos)
-   **Tareas sugeridas**: Revisar alertas, cargar producto, registrar movimiento
-   **Indicadores por rubro**:
    -   **Verdulería**: Perecibles, merma 7d, ventas por peso 30d
    -   **Almacén**: Alta rotación, margen promedio
    -   **Ferretería**: Sin movimiento 30d, categoría top, ref. técnicas bajo mínimo
-   **Acceso rápido**: Botón "Nueva venta" y "Nuevo producto"

### Qué problema resuelve

Visión centralizada del estado del negocio en un vistazo: ventas, stock, alertas y salud operativa.

### Valor para el negocio

**Crítico.** Es la primera pantalla que ve el usuario cada día. Sin esto el usuario no tiene contexto de su operación.

### Complejidad técnica

Media-alta. Hace ~15 consultas a Supabase por carga. Lógica de agregación por rubro.

### ¿Es premium o básica?

**Básica.** Todo plan debería tener dashboard. Es la puerta de entrada.

### Importancia para el cliente: **Crítica**

---

## 2. Productos (`/productos`)

### Funciones existentes

-   **CRUD completo**: Crear, leer, actualizar, desactivar, eliminar productos
-   **Campos del producto**: nombre, SKU, código de barras, unidad (unit/kg/g/box/liter/meter), precio costo, precio venta, stock mínimo, stock actual, categoría, proveedor, activo/inactivo
-   **Metadatos por rubro** (campo `metadata` JSONB):
    -   **Verdulería**: `is_perishable`, `expiration_days`, `allows_weight_sale`, `waste_tracking`, `fast_rotation`, `pinned`
    -   **Almacén**: `fast_rotation`, `suggested_margin`, `pinned`
    -   **Ferretería**: `brand`, `model`, `material`, `measure`, `technical_specs`, `pinned`
-   **Búsqueda**: Por nombre, SKU, código de barras
-   **Filtros**: Por categoría, proveedor, estado (activo/inactivo), foco (perecibles, alta rotación, margen bajo, sin movimiento)
-   **Foco por rubro**:
    -   Verdulería → "Solo perecibles"
    -   Almacén → "Alta rotación", "Margen bajo"
    -   Ferretería → "Sin movimiento 30d"
-   **Editor inline**: Actualización rápida de precio/proveedor/estado desde la tabla
-   **Toggle activo/inactivo**: Sin recargar página
-   **Escáner de código de barras**: Integrado en el formulario (3 métodos: cámara PC, lector USB, enlace celular)
-   **Validación de código de barras**: Normalización + formato + unicidad por negocio

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listProducts` | ✅ Sí | ❌ No |
| `getProductById` | ✅ Sí | ❌ No |
| `findActiveProductByBarcode` | ✅ Sí | ❌ No |
| `getProductFormData` | ✅ Sí | ❌ No |
| `createProductAction` | ❌ Solo owner | ✅ `assertProductLimit` (50 free) |
| `updateProductAction` | ❌ Solo owner | ❌ No |
| `deactivateProductAction` | ❌ Solo owner | ❌ No |
| `quickUpdateProductAction` | ❌ Solo owner | ❌ No |
| `toggleProductActiveAction` | ❌ Solo owner | ❌ No |
| `deleteProductAction` | ❌ Solo owner | ❌ No |

### Qué problema resuelve

Catálogo centralizado de productos con precios, stock, códigos de barras y metadatos por rubro.

### Valor para el negocio

**Crítico.** Sin productos no hay ventas, no hay inventario, no hay nada. Es el núcleo del sistema.

### Complejidad técnica

Media. CRUD estándar con metadatos dinámicos por rubro y escáner.

### ¿Es premium o básica?

**Básica.** El módulo de productos debe estar en todos los planes. Lo que se limita es la **cantidad** de productos.

### Importancia para el cliente: **Crítica**

---

## 3. Ventas (`/ventas`)

### Funciones existentes

-   **Nueva venta** (`/ventas/nueva`): Formulario completo con:
    -   Búsqueda de productos (por nombre, SKU, código de barras)
    -   Acceso rápido: botones de productos anclados (`pinned` en metadata)
    -   Escáner de código de barras (3 métodos)
    -   Tabla de items editable (cantidad, precio unitario, eliminar)
    -   Validación de stock antes de confirmar
    -   Método de pago: efectivo, débito, crédito, transferencia, otro
    -   Resumen: total calculado
-   **Confirmación de venta**: `create_sale_with_items` función RPC que:
    -   Valida autenticación
    -   Valida membresía al negocio
    -   Bloquea productos con `FOR UPDATE` (control concurrencia)
    -   Descuenta `current_stock` automáticamente
    -   Crea `stock_movements` tipo "sale"
    -   Genera alerta `low_stock` si corresponde
    -   Todo en una transacción atómica
-   **Lista de ventas** (`/ventas`): Tabla con items expandibles
-   **Detalle de venta** (`/ventas/[id]`): Resumen con productos, cantidades, subtotales

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listSales` | ✅ Sí | ❌ No |
| `getSaleById` | ✅ Sí | ❌ No |
| `getSaleFormData` | ✅ Sí | ❌ No |
| `createSaleAction` | ✅ Sí (owner + employee) | ✅ `assertMonthlySalesLimit` (100 free) |

### Qué problema resuelve

Registro de ventas con descuento automático de stock. El empleado puede vender sin tocar el inventario.

### Valor para el negocio

**Crítico.** Es la operación diaria. Sin ventas no hay facturación. El hecho de que el **empleado pueda vender** es el principal caso de uso.

### Complejidad técnica

Alta. Transacción atómica con RPC, `security definer` para employee, control de concurrencia con `FOR UPDATE`.

### ¿Es premium o básica?

**Básica.** Todos los planes deben permitir vender. Lo que se limita es la **cantidad de ventas mensuales**.

### Importancia para el cliente: **Crítica**

---

## 4. Inventario / Stock (`/inventario`)

### Funciones existentes

-   **Tabla de inventario** (`/inventario`): Productos con stock actual, stock mínimo, unidad
-   **Agregar stock rápido**: Botón "+" en la tabla que llama a `createStockMovement` internamente
-   **Historial de movimientos** (`/inventario/movimientos`): Lista completa de entradas, salidas, ajustes
-   **Nuevo movimiento** (`/inventario/movimientos/nuevo`): Formulario protegido (solo owner)
-   **Movimientos por producto** (`/inventario/productos/[id]/movimientos`): Historial filtrado
-   **Tipos de movimiento**: `purchase`, `sale`, `adjustment`, `waste`, `return`, `initial_stock`
-   **Alerta de bajo stock**: Se genera automáticamente al vender o mover stock

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listInventoryProducts` | ✅ Sí | ❌ No |
| `listLowStockProducts` | ✅ Sí | ❌ No |
| `createStockMovement` (interna) | ✅ Sí | ✅ `assertMonthlyStockMovementLimit` (100 free) |
| `createStockMovementAction` (formulario) | ❌ Solo owner | ✅ misma función |
| `listStockMovements` | ✅ Sí | ❌ No |
| `getMovementFormData` | ✅ Sí | ❌ No |
| `agregarStockRapidoAction` | ✅ Sí (usa createStockMovement) | ✅ misma función |

### Qué problema resuelve

Control de stock: saber cuánto hay, qué falta, qué entró/salió.

### Valor para el negocio

**Alto.** Duele no saber cuánto stock tienes. Pero el usuario básico puede vivir con la tabla de inventario + movimientos básicos.

### Complejidad técnica

Media. CRUD con actualización de stock y generación de alertas.

### ¿Es premium o básica?

**Básica.** El inventario visible debe estar en todos los planes. Los movimientos manuales (compras, ajustes, mermas) pueden limitarse.

### Importancia para el cliente: **Alta**

---

## 5. Alertas (`/alertas`)

### Funciones existentes

-   **Lista de alertas**: Tipo, mensaje, producto, fecha, estado
-   **Resolver alerta**: Marcar como resuelta (employee también puede)
-   **Tipos de alerta**: `low_stock`, `out_of_stock`, `perishable_warning`, `waste_warning`
-   **Generación automática**:
    -   `low_stock`: Al vender o mover stock, si `current_stock <= min_stock`
    -   `perishable_warning`: Al crear producto perecible con `expiration_days > 0`
    -   `out_of_stock`: No implementada como tipo separado (se refleja en low_stock con stock=0)

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listStockAlerts` | ✅ Sí (owner + employee) | ❌ No |
| `resolveStockAlertAction` | ✅ Sí (owner + employee) | ❌ No |

### Qué problema resuelve

Notificar cuando un producto está por debajo del mínimo para evitar quedarse sin stock.

### Valor para el negocio

**Alto.** Evita pérdida de ventas por falta de stock. Pero el dashboard ya muestra productos bajo mínimo.

### Complejidad técnica

Baja. Consultas simples + toggle resolved.

### ¿Es premium o básica?

**Básica.** Alertas deben estar en todos los planes. Es una función de mantenimiento diario.

### Importancia para el cliente: **Alta**

---

## 6. Proveedores (`/proveedores`)

### Funciones existentes

-   **CRUD completo**: Crear, leer, editar proveedores
-   **Campos**: nombre, teléfono, email, dirección
-   **Relación con productos**: Un producto puede tener un proveedor asociado

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listSuppliers` | ✅ Sí (lectura) | ❌ No |
| `getSupplierById` | ✅ Sí | ❌ No |
| `createSupplierAction` | ❌ Solo owner | ✅ `canBusinessUseModule("suppliers")` |
| `updateSupplierAction` | ❌ Solo owner | ✅ `canBusinessUseModule("suppliers")` |

### Protecciones

-   Página protegida con `requirePageAccess(["owner"])` → employee no puede acceder
-   Server actions protegidas con `canBusinessUseModule("suppliers")` → solo Pro+
-   En el sidebar, el módulo "suppliers" **no está incluido en el plan Free** (`config/plans.ts` línea 38)

### Qué problema resuelve

Gestión de quién le vende productos al negocio. Para reponer stock.

### Valor para el negocio

**Medio.** Útil pero no urgente. Un negocio pequeño puede funcionar sin proveedores registrados (solo compra y ya).

### Complejidad técnica

Baja. CRUD simple.

### ¿Es premium o básica?

**Premium.** Tiene sentido como feature de upgrade. Justifica pasar de Free a Pro.

### Importancia para el cliente: **Media**

---

## 7. Equipo / Empleados (`/equipo`)

### Funciones existentes

-   **Lista de miembros**: Dueño + empleados del negocio
-   **Invitar empleado**: Por email (con o sin cuenta existente)
-   **Compartir enlace de invitación**: Modal con QR + link
-   **Cancelar invitación**: Si el invitado aún no acepta
-   **Eliminar miembro**: Remover empleado del negocio
-   **Aceptación de invitación**: El invitado puede aceptar desde su login — flujo con `pending_invitations` y RLS policies dedicadas
-   **Roles**: `owner` (acceso completo) y `employee` (solo ventas + lectura)

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listTeamMembers` | ❌ Solo owner | ❌ No |
| `listPendingInvitations` | ❌ Solo owner | ❌ No |
| `inviteMemberAction` | ❌ Solo owner | ❌ No |
| `cancelInvitationAction` | ❌ Solo owner | ❌ No |
| `removeMemberAction` | ❌ Solo owner | ❌ No |

### Qué problema resuelve

Agregar empleados para que puedan vender desde su cuenta. El dueño no puede estar siempre en el local.

### Valor para el negocio

**Muy alto.** Poder tener empleados vendiendo es el principal motivo de upgrade. Un negocio con 2+ empleados necesita que cada uno pueda vender.

### Complejidad técnica

Media-alta. Sistema de invitaciones con `pending_invitations`, Realtime para QR, RLS policies para aceptación sin service_role.

### ¿Es premium o básica?

**Básica con límite.** El módulo de equipo está en todos los planes (incluido Free según `config/plans.ts`). Lo que se limita es la **cantidad de miembros**.

### Importancia para el cliente: **Crítica**

---

## 8. Reportes (`/reportes`)

### Funciones existentes

-   **Ventas por día**: Últimos 7 días con total acumulado
-   **Productos más vendidos**: Top 7 por cantidad
-   **Productos bajo stock**: Top 7 con stock actual/mínimo
-   **Movimientos y merma**: Por día, con cantidad de merma

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `getSimpleReports` | ❌ Solo owner (por página) | ✅ `canBusinessUseModule("reports")` |

### Protecciones

-   Página protegida con `requirePageAccess(["owner"])`
-   Server action protegida con `getPlanModuleAccess("reports")` → solo Pro+
-   En plan Free, muestra `<UpgradeRequired>` en lugar del contenido

### Qué problema resuelve

Visión más detallada que el dashboard sobre ventas, productos y movimientos.

### Valor para el negocio

**Medio.** Útil para tomar decisiones, pero no indispensable para la operación diaria. El dashboard ya da info similar.

### Complejidad técnica

Baja. Consultas simples agregadas.

### ¿Es premium o básica?

**Premium.** Justifica upgrade de Free a Pro. No es crítico pero se nota su ausencia.

### Importancia para el cliente: **Media**

---

## 9. Exportaciones (`/exportaciones`)

### Funciones existentes

-   **Exportación CSV**: 5 reportes (productos, inventario, movimientos, ventas, alertas) con BOM + `sep=;` para Excel
-   **Exportación Excel**: Endpoint API `/api/exportaciones/[report]/excel` con:
    -   Workbook con estilos profesionales
    -   4 temas visuales (MultiStock, Azul corporativo, Oscuro, Gris minimalista)
    -   Formato condicional, autofiltro, impresión, resumen
-   **5 generadores Excel**: `buildProductsExcel`, `buildInventoryExcel`, `buildMovementsExcel`, `buildSalesExcel`, `buildAlertsExcel`

### Server Actions / Endpoints

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `getCsvExports` | ❌ Solo owner | ✅ `canBusinessUseModule("exports")` |
| `GET /api/exportaciones/[report]/excel` | ❌ Solo owner | ✅ `canBusinessUseModule("exports")` |

### Protecciones

-   Página protegida con `requirePageAccess(["owner"])`
-   API protegida con `requireUser()` + `requireActiveBusiness()` + `canBusinessUseModule(business, "exports")`
-   En plan Free, muestra `<UpgradeRequired>`

### Qué problema resuelve

Descargar datos del negocio para análisis externo, contabilidad, respaldo.

### Valor para el negocio

**Medio-alto.** Para negocios que llevan contabilidad o necesitan compartir datos con el contador. Para el resto, es un "bonito tener".

### Complejidad técnica

Alta. Sistema completo de generación Excel con exceljs, temas, estilos, formatos condicionales.

### ¿Es premium o básica?

**Premium.** Justifica upgrade. Es una feature que se ve profesional y da confianza.

### Importancia para el cliente: **Media**

---

## 10. Auditoría (`/auditoria`)

### Funciones existentes

-   **Log de acciones**: Registro de todas las acciones sensibles con:
    -   Fecha, usuario, tipo de entidad, acción, resumen, datos antes/después
-   **Entidades auditables** (7): product, stock_movement, sale, supplier, category, stock_alert, business
-   **Acciones auditables** (8): created, updated, deleted, deactivated, stock_changed, price_changed, sale_confirmed, alert_resolved
-   **Visible para**: Solo owner
-   **Límite**: 200 registros por página

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `listAuditLogs` | ❌ Solo owner | ✅ `canBusinessUseModule("audit")` |

### Protecciones

-   Página protegida con `requirePageAccess(["owner"])`
-   Server action protegida con `getPlanModuleAccess("audit")` → solo Pro+
-   RLS en BD: solo `is_business_admin` puede SELECT

### Qué problema resuelve

Saber quién hizo qué, cuándo y cómo. Para negocios con empleados, es esencial para detectar errores o malas prácticas.

### Valor para el negocio

**Alto para negocios con empleados.** Si tienes 2+ empleados vendiendo, necesitas saber qué pasó si algo sale mal. Para negocio unipersonal, es redundante.

### Complejidad técnica

Media. Inserciones `createAuditLog` repartidas por todas las server actions. Tabla dedicada.

### ¿Es premium o básica?

**Premium.** Perfecto para vender upgrade. Duele no tenerlo cuando contratas un empleado y algo se pierde.

### Importancia para el cliente: **Alta** (con empleados) / **Baja** (unipersonal)

---

## 11. Equipo / Miembros (`/equipo` - detalle)

### Capacidad

-   **Owner**: 1 por negocio (es el creador)
-   **Employees**: Ilimitados técnicamente (sin límite en BD ni en server action)
-   **Invitación**: Por email o link compartible

### Límite actual

No existe límite de miembros en el código. `config/plans.ts` no define `maxMembers` en los límites.

### Valor

**Muy alto.** El empleado puede vender. Ese es el caso de uso principal del plan Pro.

---

## 12. Escáner de Código de Barras

### Métodos existentes

1.  **Cámara del PC** (`BarcodeScanner`): Usa `@zxing/browser` con `BrowserMultiFormatOneDReader`. Abre la cámara y detecta códigos 1D.
2.  **Enlace con celular** (`MobileBarcodeLink`): Genera QR con token → lo escaneas con el celular → el código se envía por Supabase Realtime a la PC.
3.  **Lector USB/Bluetooth** (`HidBarcodeListener`): Detecta escáneres HID que se comportan como teclado.
4.  **Página dedicada móvil** (`/escanear-codigo`): Para cuando el celular escanea y envía a la PC.

### ¿Dónde se usa?

-   Formulario de ventas (3 métodos visibles)
-   Formulario de producto (3 métodos visibles)

### Límite de plan

-   `mobileScanner: false` en plan Free (según `config/plans.ts`)
-   `mobileScanner: true` en Pro y Business

### Qué problema resuelve

Agilizar la carga de productos y la búsqueda en ventas. En lugar de escribir nombre o código, escaneas y listo.

### Valor para el negocio

**Alto.** Ahorra tiempo significativo en ventas y carga de productos. Un escáner USB cuesta $10-20 y acelera mucho la operación.

### Complejidad técnica

Alta (3 métodos distintos, Realtime, HID, cámara).

### ¿Es premium o básica?

El **escaneo local con cámara del dispositivo** está en todos los planes. El **escaneo con celular vía QR** está bloqueado en Free (según `config/plans.ts` línea 39 y línea 74).

### Importancia para el cliente: **Alta**

---

## 13. Admin Panel Global (`/admin`)

### Funciones existentes

-   **Dashboard admin**: KPIs del sistema (total usuarios, negocios, distribución de planes)
-   **Gestión de negocios**: Lista de todos los negocios con owner email
-   **Gestión de usuarios**: Lista de usuarios con rol y plan
-   **Cambiar plan de negocio**: Selector Free / Pro / Business
-   **Cambiar rol global**: Selector user / admin

### Server Actions

| Acción | ¿Disponible para employee? | Límite de plan |
|---|---|---|
| `getUsers` | ❌ Solo admin global | ❌ |
| `getBusinesses` | ❌ Solo admin global | ❌ |
| `getAdminDashboard` | ❌ Solo admin global | ❌ |
| `updateUserPlan` | ❌ Solo admin global | ❌ |
| `updateUserRole` | ❌ Solo admin global | ❌ |

### Qué problema resuelve

Administración del sistema MultiStock por parte del equipo de la plataforma.

### Complejidad técnica

Baja. CRUD simple sobre users y businesses.

---

## 14. Onboarding (`/onboarding`)

### Funciones existentes

-   **Crear primer negocio**: Nombre y tipo de negocio (verdulería, almacén, ferretería)
-   **Asignación automática**: owner_id = usuario, role = owner, subscription_plan = 'free'
-   **Redirección**: Al dashboard después de crear

### Complejidad técnica

Baja.

---

## 15. Auth (`/auth/login`, `/auth/register`)

### Funciones existentes

-   **Login**: Email + password
-   **Register**: Email + password + nombre
-   **Logout**: Server action
-   **Vinculación de invitaciones**: Al hacer login, se linkean invitaciones pendientes al usuario
-   **Creación de perfil**: Trigger `on_auth_user_created` que inserta en `profiles`

### Complejidad técnica

Media. Integración con Supabase Auth + triggers.

---

## 16. Categorías

### Funciones existentes

-   **CRUD**: Crear categorías (asociadas a un negocio y opcionalmente a un rubro)
-   **Relación**: Un producto puede tener una categoría
-   **Server action**: `createCategoryAction` — no tiene restricción de rol (cualquier miembro puede crear)

### Observación

`createCategoryAction` usa `requireUser()` + `requireActiveBusiness()` pero **no** `requireBusinessRole(["owner"])`. Cualquier miembro autenticado puede crear categorías. Sin embargo, la RLS en BD restringe INSERT a `is_business_admin`.

### Valor

**Bajo.** Las categorías son un complemento. No justifican upgrade.

---

## 17. Página de Pricing (`/pricing`) y Landing (`/`)

### Funciones existentes

-   **Landing page**: Hero, features, demo link, pricing link
-   **Pricing page**: Tabla con 3 planes (Gratis, Pro, Business)
-   **Demo**: Página de demostración

### Complejidad técnica

Baja. Páginas estáticas con marketing.

---

# Fase 2 — Mapeo de Valor Real

## Matriz de Valor

| Función | Valor percibido | Tipo de negocio | Justifica upgrade |
|---|---|---|---|
| **Ventas (crear + listar)** | Muy alto | Todos | No (básico) |
| **Ventas multiusuario (employee puede vender)** | Muy alto | Todos con empleados | **Sí** |
| **Productos (ver + buscar)** | Muy alto | Todos | No (básico) |
| **Crear/editar productos** | Alto | Todos | No (básico, pero limitado por cantidad) |
| **Inventario (ver stock)** | Alto | Todos | No (básico) |
| **Registrar movimientos de stock** | Alto | Todos | Parcial (Free puede via venta) |
| **Dashboard con KPIs** | Alto | Todos | No (básico) |
| **Alertas de stock** | Alto | Todos | No (básico) |
| **Escáner cámara PC** | Alto | Todos | No (básico) |
| **Escáner enlace celular** | Alto | Todos | **Sí** (solo Pro+) |
| **Tener empleados** | Muy alto | Todos con empleados | **Sí (el principal)** |
| **Proveedores** | Medio | Todos | **Sí** (solo Pro+) |
| **Reportes** | Medio | Todos | **Sí** (solo Pro+) |
| **Exportaciones CSV/Excel** | Medio-Alto | Todos (contadores) | **Sí** (solo Pro+) |
| **Auditoría** | Alto (con empleados) / Bajo (sin) | Negocios con empleados | **Sí** (solo Pro+) |
| **Dashboard por rubro** | Medio | Específico por rubro | No |
| **Productos: 500 Pro / 1.500 Super / Ilimitado Enterprise** | Alto | Todos con +50 productos | **Sí** |
| **Ventas ilimitadas al mes** | Alto | Todos con +50 ventas/mes | **Sí** |
| **Fiado (futuro)** | Muy alto | Almacenes, verdulerías | **Sí** |

---

# Fase 3 — Funciones Gancho

## Identificación de funciones que venden upgrade

### 🥇 "¿Quieres que tu empleado pueda vender?"

**Por qué vende:** El dueño no puede estar 24/7 en el local. Necesita que el empleado venda.
**Qué cliente:** Cualquiera con 1+ empleados.
**Cuándo duele:** El día que el dueño no está y pierde una venta porque el empleado no puede cobrar.
**Estado actual:** El employee **ya puede vender** (vía `create_sale_with_items` con `security definer`). Pero el módulo "team" está disponible en todos los planes. La limitación está en el número de miembros.

### 🥇 "¿Te quedaste sin productos para cargar?"

**Por qué vende:** 50 productos es poco para cualquier negocio con crecimiento, pero alcanza para probar.
**Qué cliente:** Todos.
**Cuándo duele:** A las 2 semanas de usar el sistema.
**Estado actual:** `assertProductLimit` en `createProductAction` bloquea en 50 productos activos en plan Free. En Pro y Super también tiene límite (500 y 1.500 respectivamente).

### 🥇 "¿Llegaste al límite de ventas del mes?"

**Por qué vende:** 100 ventas mensuales son ~3 ventas/día. Un negocio real pequeño puede vivir 1-2 meses con eso antes de necesitar upgrade.
**Qué cliente:** Todos con movimiento diario.
**Cuándo duele:** A mitad de mes cuando no puedes registrar más ventas.
**Estado actual:** `assertMonthlySalesLimit` bloquea en 100 ventas/mes en plan Free.

### 🥇 "¿Necesitas registrar una compra o ajuste de stock?"

**Por qué vende:** 100 movimientos mensuales suenan a muchos, pero entre compras, mermas y ajustes se van rápido.
**Qué cliente:** Negocios que reciben mercadería seguido.
**Cuándo duele:** Cuando no puedes registrar una compra porque bloquea.
**Estado actual:** `assertMonthlyStockMovementLimit` bloquea en 100 movimientos/mes en plan Free.

### 🥈 "¿Quieres ver el historial de quién hizo qué?"

**Por qué vende:** Da tranquilidad al dueño que contrata empleados.
**Qué cliente:** Negocios con 2+ empleados.
**Cuándo duele:** Cuando falta stock y no sabes quién vendió mal.
**Estado actual:** Auditoría bloqueada en Free (`getPlanModuleAccess("audit")`).

### 🥈 "¿Necesitas reportes para tomar decisiones?"

**Por qué vende:** El dashboard da info básica. Los reportes dan profundidad.
**Qué cliente:** Dueños que analizan su negocio.
**Cuándo duele:** Cuando quieres saber qué producto se vende más y no puedes.
**Estado actual:** Reportes bloqueados en Free.

### 🥈 "¿Descargar datos para tu contador?"

**Por qué vende:** El contador siempre pide informes.
**Qué cliente:** Negocios que llevan contabilidad formal.
**Cuándo duele:** Cada fin de mes.
**Estado actual:** Exportaciones bloqueadas en Free.

### 🥉 "¿Quieres escanear códigos con el celular de tu empleado?"

**Por qué vende:** Es más cómodo que usar la cámara del PC.
**Qué cliente:** Negocios donde el empleado tiene un celular.
**Cuándo duele:** Cuando el PC no tiene cámara o el código está en la estantería.
**Estado actual:** `mobileScanner: false` en Free.

### 🥉 "¿Necesitas registrar proveedores?"

**Por qué vende:** Ayuda a organizar compras.
**Qué cliente:** Negocios con 5+ proveedores.
**Cuándo duele:** Cuando no recuerdas a quién le compraste algo.
**Estado actual:** Módulo proveedores bloqueado en Free.

---

## Mapa de conversión Free → Pro

```
                         ┌──────────────────────┐
                         │      PLAN FREE        │
                         │  $0 · 1 usuario       │
                         │  50 productos         │
                         │  100 ventas/mes       │
                         │  100 movimientos/mes  │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           "Necesito más     "Tengo empleados"  "Quiero reportes"
            productos"                           "y exportaciones"
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │      PLAN PRO         │
                         │  $14.990              │
                         │  Productos: 500         │
                         │  Ventas ilimitadas    │
                         │  Reportes + Auditoría │
                         │  Exportaciones        │
                         │  Escáner celular      │
                         └──────────────────────┘
```

---

# Fase 4 — Limitaciones Inteligentes

## ¿Qué tiene sentido limitar?

### 1. Productos activos

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Sí.** Es la limitación más clara y entendible. 50 productos da para probar 1-2 meses y luego impulsa upgrade. |
| ¿Molesta al usuario? | **Sí,** pero impulsa upgrade. |
| ¿Incentiva upgrade? | **Mucho.** Es el primer límite que se alcanza. |
| ¿Fácil implementación? | **Ya existe.** `assertProductLimit` cuenta productos activos con `.eq("active", true)`. |
| ¿Rompé UX? | **No.** Se muestra mensaje claro "Actualiza a Pro para seguir cargando productos". |
| **Valor actual:** | 50 productos (Free), **500** (Pro), **1.500** (Super), ilimitado (Enterprise) |
| **Recomendación:** | Free: 50 productos. Pro: **500** (no ilimitado). Super: **1.500**. Enterprise: ilimitado. Progresión 50→500→1.500→∞ da escalones claros de upgrade. |

### 2. Ventas mensuales

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Sí.** Limitar por volumen de operación es estándar SaaS. |
| ¿Molesta al usuario? | **Mucho.** No poder vender a mitad de mes es frustrante. |
| ¿Incentiva upgrade? | **Muchísimo.** Bloquea el core del negocio. |
| ¿Fácil implementación? | **Ya existe.** `assertMonthlySalesLimit` cuenta ventas del mes calendario. |
| ¿Rompé UX? | **Riesgo.** Si el usuario no puede vender, puede abandonar el sistema. Debe ser un límite alto. |
| **Valor actual:** | 100 ventas/mes (Free) |
| **Recomendación:** | Subir a **100 ventas/mes** en Free. 50 es muy bajo (~1.6/día). Con 100 (~3.3/día) das margen para probar. |

### 3. Movimientos de stock mensuales

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Sí.** Controla el uso del inventario. |
| ¿Molesta al usuario? | **Media.** El usuario promedio no hace tantos movimientos manuales. |
| ¿Incentiva upgrade? | **Media.** Menos que ventas o productos. |
| ¿Fácil implementación? | **Ya existe.** `assertMonthlyStockMovementLimit`. |
| ¿Rompé UX? | **No.** La mayoría de negocios pequeños no llega a 100 movimientos/mes. |
| **Valor actual:** | 100 movimientos/mes (Free) |
| **Recomendación:** | Mantener en **100** o subir a **200**. No es el límite que más duele. |

### 4. Miembros (usuarios del negocio)

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Mucho.** Es la principal razón de upgrade. "¿Quieres que tu empleado venda?" |
| ¿Molesta al usuario? | **Sí.** Si tienes 2 empleados y solo puedes tener 1, pagas. |
| ¿Incentiva upgrade? | **Muchísimo.** Es el gancho principal. |
| ¿Fácil implementación? | **No existe aún.** Hay que implementar `assertMemberLimit`. |
| ¿Rompé UX? | **No.** Bloquear "invitar miembro" es aceptable. |
| **Recomendación:** | **Free: 1 owner + 0 employees** (un solo usuario). **Pro: 2 miembros** (owner + 1 employee). **Super: 4 miembros**. **Enterprise: Ilimitado**. Implementar `assertMemberLimit` en `inviteMemberAction`. |

### 5. Escáner con celular (mobile scanner)

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Sí.** Es una feature claramente premium. |
| ¿Molesta al usuario? | **Poco.** El usuario Free puede usar la cámara del PC. |
| ¿Incentiva upgrade? | **Bajo.** No es la razón principal para pagar. |
| ¿Fácil implementación? | **Ya existe.** `canUseMobileScanner` en config/plans.ts. |
| ¿Rompé UX? | **No.** Simplemente no se muestra el botón. |
| **Recomendación:** | Mantener como está. Pro+ tiene escáner celular. |

### 6. Sucursales (multi-business)

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Sí.** Para negocios con varias sucursales. |
| ¿Molesta al usuario? | **No hoy.** El feature flag `branches_v2` está en `false`. |
| ¿Incentiva upgrade? | **Potencialmente alto** cuando esté implementado. |
| ¿Fácil implementación? | **No implementado aún.** Solo flag en feature-flags.ts. |
| **Recomendación:** | Pospuesto. No implementado. No considerar hoy. |

### 7. Fiado/Crédito (futuro)

| Aspecto | Respuesta |
|---|---|
| ¿Sentido comercial? | **Altísimo.** Es una feature que todo almacén/verdulería necesita. |
| ¿Molesta al usuario? | **Ya duele no tenerlo.** |
| ¿Incentiva upgrade? | **Muchísimo.** Podría ser exclusivo de Super+ o ser add-on. |
| ¿Fácil implementación? | **No implementado aún.** Solo mencionado como funcionalidad futura. |
| **Recomendación:** | Cuando se implemente, ponerlo con límites escalonados: **Pro: 10 personas, Super: 100 personas, Enterprise: ilimitado**. Es una feature con valor percibido muy alto que por sí sola justifica upgrades entre planes. |

### 8. ¿Qué NO limitar?

| Feature | Motivo |
|---|---|
| Dashboard | Es la cara del sistema. Todos deben ver su negocio. |
| Productos (ver/buscar) | Necesario para operar. |
| Ventas (crear) | El core del sistema. Se limita por cantidad, no por acceso. |
| Inventario (ver) | Necesario para operar. |
| Alertas (ver/resolver) | Mantenimiento diario básico. |
| Categorías | No vale la pena limitar. |
| Escáner cámara PC | Método básico de escaneo. |
| 1 empleado (en Pro) | Suficiente para negocios pequeños. |

---

# Fase 5 — Análisis de Negocios Reales

## 🥬 Verdulería pequeña (puesto de feria / local barrial)

| Aspecto | Realidad |
|---|---|
| Productos típicos | 20-80 (frutas y verduras de temporada). Muchos productos rotan semanalmente. |
| Empleados | 0-2 (generalmente dueño + 1 ayudante). |
| Ventas diarias | 20-80 transacciones. Monto promedio bajo ($2.000-$5.000 CLP). |
| Método de pago | Efectivo principalmente. |
| Código de barras | Casi nunca. Los productos a granel no tienen código. |
| Módulos clave | Ventas rápidas, peso, control de merma. |
| Dolor principal | La merma (lo que se echa a perder). No saben cuánto pierden. |
| ¿Pagará upgrade? | **Difícil.** Operan con margen ajustado. El plan Free debe ser funcional para ellos. |
| Productos | 50 es justo. Una verdulería tiene fácil 40-50 productos. |
| Empleados | Si tiene 1 empleado, necesita que pueda vender. |

## 🏪 Almacén de barrio

| Aspecto | Realidad |
|---|---|
| Productos típicos | 100-500 (desde bebidas hasta pastas, enlatados, lácteos). |
| Empleados | 0-3 (dueño + cajero + repositor). |
| Ventas diarias | 30-150 transacciones. Ticket promedio $3.000-$8.000 CLP. |
| Método de pago | Efectivo + débito + crédito. |
| Código de barras | **Sí.** Casi todos los productos industrializados tienen código. |
| Módulos clave | Ventas, escáner, proveedores, fiado (crítico). |
| Dolor principal | El fiado. La mayoría da crédito a clientes conocidos y pierde el control. |
| ¿Pagará upgrade? | **Sí, si necesita empleados o fiado.** |
| Productos | 50 es justo para probar, pero un almacén típico necesita 100+. El Pro con 500 productos cubre bien. |
| Empleados | Si tiene cajero, necesita que pueda vender. |

## 🔧 Ferretería pequeña

| Aspecto | Realidad |
|---|---|
| Productos típicos | 200-2.000 (clavos, tornillos, herramientas, pintura, tubería). |
| Empleados | 1-4 (dueño + vendedores + bodeguero). |
| Ventas diarias | 15-60 transacciones. Ticket alto ($10.000-$50.000 CLP). |
| Método de pago | Efectivo + débito + crédito + transferencia. |
| Código de barras | Algunos sí (productos de marca). Otros no (tubería por metro, alambre). |
| Módulos clave | Productos con datos técnicos, stock, ventas. |
| Dolor principal | Stock de productos técnicos (saber qué medida de tornillo tienes). Productos sin movimiento. |
| ¿Pagará upgrade? | **Sí.** Tienen más margen y necesitan más funcionalidad. |
| Productos | 50 es poco para una ferretería (tienen cientos de SKUs). Necesitarán Pro (500) o Super (1.500). |
| Empleados | Si tiene vendedores, necesitan poder vender. |

## 🏪 Negocio mediano (varias sucursales / alta facturación)

| Aspecto | Realidad |
|---|---|
| Productos típicos | 500-5.000+ |
| Empleados | 3-10+ |
| Ventas diarias | 100-500+ transacciones |
| ¿Pagará upgrade? | **Sí, sin dudar.** Necesitan todo: múltiples empleados, reportes, exportaciones, auditoría. |
| Plan ideal | Super o Enterprise. |

---

## Resumen de límites reales por tipo de negocio

| Tipo | Productos reales | Empleados reales | Ventas/día reales | Plan ideal |
|---|---|---|---|---|
| Verdulería pequeña | 30-80 | 0-1 | 20-50 | Free (ajustado) o Pro |
| Almacén barrio | 100-500 | 1-3 | 30-100 | Pro o Super |
| Ferretería pequeña | 200-1.000 | 1-4 | 15-50 | Pro o Super |
| Negocio mediano | 500-5.000+ | 3-10+ | 100-500+ | Super o Enterprise |

---

# Fase 6 — Propuesta de Planes (Corregida)

> **Corrección clave respecto al análisis original:**
> El error más grande del primer análisis fue hacer el **Pro DEMASIADO poderoso** (productos ilimitados + todas las features premium).
> Si Pro tiene todo, Super no tiene razón de existir para la mayoría de los negocios.
> La corrección es escalar los límites de **PRODUCTOS y FIADO**, no solo los empleados.
> El motor de upgrade real no son solo los empleados — son **empleados + productos + fiado** escalonados.

## Consideraciones de precio para Chile

-   **$14.990 CLP** ≈ ~$16 USD — Punto dulce para SaaS chileno B2B
-   **$24.990 CLP** — Precio para negocio que ya creció y necesita más capacidad
-   **$34.990 CLP** — Precio para negocio grande sin techo
-   **IVA incluido** es obligatorio en precios B2C chilenos
-   Un **almacén con 2 empleados** que vende ~$500.000/día paga $14.990 sin dudar
-   Una **verdulería pequeña** difícilmente paga desde el día 1 — el Free debe ser funcional

---

## PLAN GRATIS

**Precio:** $0 CLP (IVA incluido) · siempre gratis

**Usuario ideal:** Dueño único de verdulería, almacén o ferretería pequeña que quiere probar el sistema sin compromiso.

**Objetivo del plan:** Que el usuario pueda operar su negocio real 1-2 meses y sienta la necesidad de upgrade al crecer. No una demo — un producto funcional.

### Límites

| Recurso | Límite |
|---|---|
| Productos activos | **50** |
| Ventas mensuales | **100** (~3/día — permite probar sin bloquear a la semana) |
| Movimientos de stock mensuales | **100** |
| Miembros del negocio | **1** (solo el owner, sin empleados) |
| Negocios activos | **1** |

### Funciones incluidas

| Módulo | ¿Incluido? |
|---|---|
| Dashboard | ✅ |
| Productos (ver, crear, editar) | ✅ (limitado a 50) |
| Inventario (ver stock) | ✅ |
| Ventas (crear + listar) | ✅ (limitado a 100/mes) |
| Alertas (ver + resolver) | ✅ |
| Equipo (ver miembros) | ✅ (solo owner) |
| Escáner cámara PC | ✅ |
| Escáner lector USB | ✅ |
| Categorías | ✅ |

### Funciones bloqueadas

| Módulo | ¿Bloqueado? |
|---|---|
| Invitar empleados | ✗ (solo 1 usuario) |
| Proveedores | ✗ (módulo no visible) |
| Reportes | ✗ (página bloqueada) |
| Exportaciones CSV/Excel | ✗ (página bloqueada) |
| Auditoría | ✗ (página bloqueada) |
| Escáner con celular (QR) | ✗ |
| Fiado (futuro) | ✗ |

### Razón comercial

El Free existe para que el usuario **pruebe el sistema con su negocio real**. 50 productos alcanzan para una verdulería pequeña. 100 ventas/mes dejan probar 1-2 meses antes de topear. Al llegar al límite de productos, empleados o reportes, el upgrade se siente natural.

### Qué hará al usuario querer upgrade

1. **"Necesito que mi empleado venda"** → upgrade a Pro
2. **"Ya tengo más de 50 productos"** → upgrade a Pro
3. **"Llegué a 100 ventas y estamos a mitad de mes"** → upgrade a Pro
4. **"Quiero ver reportes / exportaciones"** → upgrade a Pro
5. **"Necesito registrar proveedores"** → upgrade a Pro

---

## PLAN PRO

**Precio:** $14.990 CLP/mes (IVA incluido)

**Usuario ideal:** Almacén de barrio, verdulería con ayudante, minimarket pequeño. Dueño + 1 empleado. Negocio con catálogo de hasta 500 productos.

**Objetivo del plan:** **El plan que paga las cuentas.** Debe ser el más vendido. Cubre al 80% de los negocios chilenos.

### Límites

| Recurso | Límite |
|---|---|
| Productos activos | **500** |
| Ventas mensuales | **Ilimitado** |
| Movimientos de stock mensuales | **1.000** |
| Miembros del negocio | **2** (owner + 1 employee) |
| Negocios activos | **1** |

### Funciones incluidas

Todo lo del plan Free, más:

| Módulo | ¿Incluido? |
|---|---|
| Invitar **1 empleado** | ✅ |
| Proveedores | ✅ |
| Reportes | ✅ |
| Exportaciones CSV + Excel | ✅ |
| Auditoría | ✅ |
| Escáner con celular (QR) | ✅ |
| **Fiado (futuro) — hasta 10 personas** | ✅ |

### Funciones bloqueadas

| Módulo | ¿Bloqueado? |
|---|---|
| Más de 1 empleado | ✗ (2 usuarios máximo) |
| Más de 500 productos | ✗ |
| Fiado ampliado (+10 personas) | ✗ |
| Más de 1 negocio | ✗ |
| Soporte prioritario | ✗ (solo email+WA estándar) |

### Razón comercial

**¿Por qué 500 productos y no ilimitado?**
Porque si Pro ya tiene todo ilimitado, ¿para qué existe Super? 500 productos alcanzan para:
- Un almacén de barrio (100-300 productos reales)
- Una verdulería con proveedores (30-80 productos)
- Una ferretería pequeña (200-500 productos)

Cuando el negocio supera los 500 productos, ya es un negocio que justifica pagar más.
Además, 500 productos es un límite que se ve lejano al empezar, pero alcanzable al crecer. Crea el "techo" correcto para impulsar upgrade a Super sin sentirse castigado.

**¿Por qué $14.990 y no $17.990?**
- $14.990 suena a "menos de 15 lucas" — umbral psicológico
- Reduce la fricción Free → Pro
- Para Chile, $15K es el nuevo $10K

### Qué hará al usuario querer upgrade a Super

1. **"Tengo más de 500 productos"** → mi negocio creció
2. **"Necesito un segundo empleado"** → 2 cajeros o empleados
3. **"El fiado de 10 personas se me queda corto"** → necesito más
4. **"Quiero soporte más rápido"** → WhatsApp prioritario

---

## PLAN SUPER

**Precio:** $24.990 CLP/mes (IVA incluido)

**Usuario ideal:** Ferretería en crecimiento, almacén grande con 2-3 empleados, negocio que ya superó los 500 productos.

**Objetivo del plan:** Capturar negocios que crecieron y necesitan más capacidad. La diferencia con Pro es clara: más productos, más empleados, más fiado.

### Límites

| Recurso | Límite |
|---|---|
| Productos activos | **1.500** |
| Ventas mensuales | **Ilimitado** |
| Movimientos de stock mensuales | **Ilimitado** |
| Miembros del negocio | **4** (owner + hasta 3 employees) |
| Negocios activos | **1** |

### Funciones incluidas

Todo lo del plan Pro, más:

| Módulo | ¿Incluido? |
|---|---|
| Hasta **3 empleados** | ✅ |
| Exportaciones Excel con **temas premium** | ✅ |
| **Fiado ampliado — hasta 100 personas** | ✅ |
| Soporte prioritario (WhatsApp, respuesta 4-8h) | ✅ |
| Acceso anticipado a nuevas funciones | ✅ |
| Analytics más avanzados | ✅ |

### Funciones bloqueadas

| Módulo | ¿Bloqueado? |
|---|---|
| Más de 1.500 productos | ✗ |
| Más de 3 empleados | ✗ |
| Multi-negocio / sucursales | ✗ (cuando exista) |

### Razón comercial

Super existe para que el negocio que **ya pagó Pro** tenga un escalón natural al subir. La diferencia con Pro no es un solo factor, son **tres**: más productos (500→1.500), más empleados (1→3), más fiado (10→100 personas). Cualquiera de esas tres necesidades justifica los $10.000 adicionales.

---

## PLAN ENTERPRISE

**Precio:** $34.990 CLP/mes (IVA incluido)

**Usuario ideal:** Negocio grande con 5+ empleados, múltiples sucursales (cuando esté implementado), catálogo extenso (+1.500 productos).

**Objetivo del plan:** Ser el plan "sin techo". El negocio más grande que use MultiStock debe caber aquí.

### Límites

| Recurso | Límite |
|---|---|
| Productos activos | **Ilimitado** |
| Ventas mensuales | **Ilimitado** |
| Movimientos de stock mensuales | **Ilimitado** |
| Miembros del negocio | **Ilimitado** |
| Negocios activos | **Ilimitado** (multi-business cuando esté listo) |
| Fiado (futuro) | **Ilimitado** |

### Funciones incluidas

Todo lo del plan Super, más:

| Módulo | ¿Incluido? |
|---|---|
| Empleados ilimitados | ✅ |
| Productos ilimitados | ✅ |
| Fiado ilimitado | ✅ |
| Múltiples negocios/sucursales | ✅ (cuando esté implementado) |
| Soporte dedicado máximo | ✅ |
| Onboarding dedicado (sesión 60min + revisión mensual) | ✅ |

### Razón comercial

Para negocios que ya no caben en Super. Es un plan de "techo alto" que permite escalar sin cambiar de plataforma. También justifica el desarrollo de funciones multi-sucursal a largo plazo.

---

## Tabla Comparativa Final

| Característica | Free | Pro | Super | Enterprise |
|---|---|---|---|---|
| **Precio** | $0 | $14.990 | $24.990 | $34.990 |
| **Productos** | 50 | **500** | **1.500** | Ilimitado |
| **Ventas/mes** | 100 | Ilimitado | Ilimitado | Ilimitado |
| **Movimientos/mes** | 100 | 1.000 | Ilimitado | Ilimitado |
| **Miembros** | 1 (owner) | 2 (1 emp.) | 4 (3 emp.) | Ilimitado |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Alertas** | ✅ | ✅ | ✅ | ✅ |
| **Escáner PC/USB** | ✅ | ✅ | ✅ | ✅ |
| **Escáner celular** | ❌ | ✅ | ✅ | ✅ |
| **Proveedores** | ❌ | ✅ | ✅ | ✅ |
| **Reportes** | ❌ | ✅ | ✅ | ✅ |
| **Exportaciones** | ❌ | ✅ | ✅ | ✅ |
| **Auditoría** | ❌ | ✅ | ✅ | ✅ |
| **Fiado (futuro)** | ❌ | **10 personas** | **100 personas** | Ilimitado |
| **Soporte** | Email 72h | Email+WA 24-48h | WA prioritario 4-8h | Dedicado |

### La pirámide de valor

```
                    ┌──────────────┐
                    │  Enterprise  │
                    │  $34.990     │
                    │  Sin techo   │
                    ├──────────────┤
                    │    Super     │
                    │  $24.990     │
                    │  Crecer      │
              ┌─────┴──────────────┴─────┐
              │          Pro             │
              │       $14.990            │
              │   El plan que vende      │
              │  500 pdts · 1 emp.       │
              │  Reportes · Fiado 10     │
              └─────┬──────────────┬─────┘
                    │    Free      │
                    │    $0        │
                    │  50 pdts     │
                    │  Probar      │
                    └──────────────┘
```

---

# Fase 7 — Implementación Técnica

## Basado en el código REAL existente

### 1. Aumentar límite de productos en Free

**Archivo:** `config/plans.ts`

```typescript
// Línea 34 - Cambiar de 30 a 50
products: 50,
```

**Ya existe** `assertProductLimit` en `lib/billing/plan-guards.ts` que cuenta productos activos con `.eq("active", true)`. El cambio es solo el número.

### 2. Aumentar límite de ventas en Free

**Archivo:** `config/plans.ts`

```typescript
// Línea 35 - Cambiar de 50 a 100
monthlySales: 100,
```

**Ya existe** `assertMonthlySalesLimit` que cuenta ventas del mes con `.gte("created_at", startOfMonth)`. Solo cambiar número.

### 3. Cambiar límite de productos en Pro y Super

**Archivo:** `config/plans.ts`

Corrección clave: Pro pasa de `null` (ilimitado) a **500**, y Super pasa de `null` (ilimitado) a **1.500**.

```typescript
// Pro:
products: 500,   // antes null (ilimitado)

// Super:
products: 1500,  // antes null (ilimitado)
```

**`assertProductLimit` ya existe y valida contra el límite del plan.** Con este cambio, el guardia empezará a rechazar cuando se superen 500 productos en Pro o 1.500 en Super, sin necesidad de crear nuevas validaciones.

### 4. Agregar límite de miembros

**No existe.** Hay que crearlo.

**Archivos a tocar:**

-   **`config/plans.ts`**: Agregar `members` al tipo `PlanDefinition.limits`:

    ```typescript
    limits: {
        products: number | null;
        monthlySales: number | null;
        monthlyStockMovements: number | null;
        members: number | null;  // NUEVO
    };
    ```

    -   Free: `members: 1`
    -   Pro: `members: 2`
    -   Super: `members: 4`
    -   Enterprise: `members: null` (ilimitado)

-   **`lib/billing/plan-guards.ts`**: Crear `assertMemberLimit` que cuente `business_users` activos para el negocio más el owner:

    ```typescript
    export async function assertMemberLimit(
        supabase: SupabaseServerClient,
        business: ActiveBusiness
    ): Promise<string | null> {
        const limit = getPlanLimits(business.subscription_plan).members;
        if (limit === null) return null;

        // Count owner as 1 + employees
        const { count, error } = await supabase
            .from("business_users")
            .select("id", { count: "exact", head: true })
            .eq("business_id", business.id);
        // count = employees only. owner is in businesses.owner_id
        // Total = 1 (owner) + count (employees)

        const totalMembers = 1 + (count ?? 0);
        if (totalMembers >= limit) {
            return `Tu plan permite hasta ${limit} miembros. Actualiza para agregar más usuarios.`;
        }
        return null;
    }
    ```

-   **`modules/core/team/actions.ts`**: Agregar `assertMemberLimit` en `inviteMemberAction` antes de crear la invitación:

    ```typescript
    // Dentro de inviteMemberAction, después de requireBusinessRole
    const limitMessage = await assertMemberLimit(supabase, business);
    if (limitMessage) return { message: limitMessage };
    ```

### 4. Mostrar/ocultar botón "Invitar miembro" en la UI

**Archivo:** `app/(app)/equipo/page.tsx`

Verificar el límite de miembros actual vs. el límite del plan para mostrar u ocultar el botón de invitar.

**Archivo:** `components/team/invite-member-form.tsx`

O puede ser en el server component de la página, consultando el límite similar a como se hace con `getPlanModuleAccess`.

### 5. El resto de limitaciones YA existen

-   **Proveedores**: `canBusinessUseModule("suppliers")` — ya filtra en sidebar + server actions
-   **Reportes**: `getPlanModuleAccess("reports")` — ya muestra UpgradeRequired
-   **Exportaciones**: `canBusinessUseModule("exports")` — ya protege página + API
-   **Auditoría**: `getPlanModuleAccess("audit")` — ya muestra UpgradeRequired
-   **Escáner celular**: `canUseMobileScanner` — ya filtra en UI

### 6. Actualizar navegación según plan

**Archivo:** `app/(app)/layout.tsx`

Ya existe el filtrado por plan en la navegación. Hay que asegurarse de que `getNavigationForBusinessType(business.business_type, business.subscription_plan)` se ejecute correctamente.

**Archivo:** `config/navigation.ts`

`getNavigationForBusinessType` ya filtra por `canUseModule(subscriptionPlan, item.module)`. Revisar que los módulos estén correctamente asignados en `PLAN_DEFINITIONS.modules`.

### 7. Actualizar landing y pricing

**Archivo:** `app/(site)/pricing/page.tsx`

Actualizar para reflejar los nuevos límites y precios. Los datos están en `PLAN_DEFINITIONS` (config/plans.ts). Idealmente la pricing page lee de ahí para mantenerse sincronizada.

### 8. Fiado (futuro)

Cuando se implemente:
-   Crear feature flag `credit_v1` en `config/feature-flags.ts`
-   Agregar módulo `"credit"` a `config/navigation.ts` como `AppModule`
-   Agregar `"credit"` con límite de **10 personas** a `PLAN_DEFINITIONS.pro.modules`, **100 personas** a `PLAN_DEFINITIONS.super.modules` e **ilimitado** a `PLAN_DEFINITIONS.enterprise.modules`
-   Esto convierte al fiado en un motor de upgrade por sí solo: cada plan tiene un límite distinto

---

## Resumen de archivos a modificar

| Archivo | Cambio |
|---|---|
| `config/plans.ts` | Free: products=50, sales=100; Pro: products=500; Super: products=1.500; agregar `members` en todos |
| `config/navigation.ts` | Si se agrega módulo `credit` o `fiado` futuro |
| `lib/billing/plan-guards.ts` | Crear `assertMemberLimit` |
| `modules/core/team/actions.ts` | Agregar `assertMemberLimit` en `inviteMemberAction` |
| `app/(app)/equipo/page.tsx` | Verificar límite de miembros antes de mostrar botón invitar |
| `app/(site)/pricing/page.tsx` | Sincronizar con `PLAN_DEFINITIONS` |
| `types/database.ts` | Si se agrega `members` a tipo de límites |

---

# Conclusión Final

> **Si yo fuera el dueño de MultiStock, estos serían los planes que vendería y por qué:**

## Lo que aprendí del código

MultiStock ya tiene un producto **sólido y funcional**. El código revela un sistema con:

-   **13 tablas** en Supabase con RLS policies granulares
-   **40+ server actions** catalogadas con guardias de rol y plan
-   **3 rubros** con adaptación completa de UI, metadata y dashboard
-   **4 métodos de escaneo** (cámara PC, celular, USB, HID)
-   **Exportaciones Excel** con sistema de temas profesionales
-   **Auditoría** completa de todas las acciones sensibles
-   **Sistema de invitaciones** robusto con aceptación sin service_role

## Los planes que vendería

### Free ($0) — Para probar y operar pequeño

50 productos, 100 ventas/mes, 1 usuario. Sin empleados. Suficiente para una verdulería pequeña o para probar el sistema 1-2 meses. **Duele justo en los puntos correctos** para impulsar upgrade: no poder agregar más productos, no poder tener empleados.

### Pro ($14.990) — El plan real

500 productos, 1 empleado, reportes, exportaciones, auditoría, fiado básico (10 personas). **Este es el producto.** A $14.990 CLP/mes, cualquier negocio con 1 empleado y movimiento diario debería estar aquí. El límite de 500 productos cubre al 80% de los negocios chilenos sin hacer el plan demasiado poderoso.

### Super ($24.990) — Para crecer

1.500 productos, hasta 3 empleados, fiado ampliado (100 personas), soporte prioritario. La diferencia con Pro son **tres ejes**: productos, empleados y fiado. Cualquier negocio que haya crecido lo suficiente justifica los $10.000 adicionales.

### Enterprise ($34.990) — Sin límites

Productos ilimitados, empleados ilimitados, fiado ilimitado, multi-business futuro, soporte dedicado. Para los casos grandes que no caben en Super.

## ¿Tienen sentido los precios actuales para Chile?

-   **$14.990** → **Sí.** Es el punto dulce para un SaaS chileno B2B. Un almacén que vende $500.000/día paga $14.990/mes sin pensar.
-   **$24.990** → **Sí.** Para negocios con 3 empleados, el costo por usuario es ~$8.300, razonable.
-   **$34.990** → **Aceptable.** Para negocios grandes, es un costo operacional más.

## La estrategia correcta

1.  **El Free no debe ser una demo.** Debe ser un producto funcional que el usuario pueda usar en su negocio real. Así se engancha.
2.  **El límite de empleados es el mejor vendedor**, pero no el único. La combinación **productos + empleados + fiado** escalonados en cada plan crea múltiples motores de upgrade.
3.  **Pro con 500 productos (no ilimitados) es la decisión correcta.** Si Pro tiene todo, Super no existe. El escalón 50 → 500 → 1.500 → ilimitado da una progresión natural.
4.  **Pro debe ser el plan por defecto.** El Free es para probar. Pro es para operar.
5.  **El fiado será un game-changer** cuando se implemente. Con límites de 10/100/ilimitado personas, es un upgrade driver por sí solo.
6.  **Los $14.990 están bien.** No bajaría más. Subiría a $17.990 solo si hay suficiente demanda y el producto madura.
