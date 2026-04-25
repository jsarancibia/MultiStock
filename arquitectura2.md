# Arquitectura 2 - Modulos internos, productos e inventario

Este archivo contiene las fases 4, 5 y 6 del proyecto MultiStock. El objetivo es construir el nucleo operativo del sistema: layout interno, configuracion modular, productos, categorias, proveedores, stock y movimientos.

Antes de empezar este archivo deben estar completas las fases de `arquitectura1.md`.

## Reglas para Cursor

- No construir ventas todavia, salvo lo necesario para preparar el inventario.
- Cada consulta debe filtrar por el negocio activo.
- No mostrar datos de otros negocios.
- Mantener formularios simples y funcionales.
- Usar `metadata` para campos especificos por rubro durante el MVP.
- Evitar sobreingenieria: primero CRUD completo y confiable.
- Todos los cambios de stock deben generar un registro en `stock_movements`.

---

# Fase 4 - Layout interno y configuracion modular

## Objetivo

Crear la estructura visual interna del sistema y preparar la navegacion segun los modulos disponibles para cada rubro.

## Resultado esperado

Al finalizar esta fase, el usuario autenticado debe entrar a un panel privado con sidebar, header, datos del negocio activo y navegacion base.

## Rutas internas iniciales

```txt
/dashboard
/productos
/inventario
/ventas
/proveedores
/alertas
```

Aunque algunas rutas todavia no tengan funcionalidad completa, pueden existir como paginas placeholder para ordenar el proyecto.

## Tareas para Cursor

1. Crear layout privado para rutas autenticadas.
2. Crear sidebar principal.
3. Crear header superior.
4. Mostrar nombre del negocio activo.
5. Mostrar tipo de negocio activo.
6. Crear navegacion desde `config/navigation.ts`.
7. Crear helper para obtener modulos habilitados segun rubro.
8. Crear componentes base:
   - `AppSidebar`
   - `AppHeader`
   - `PageHeader`
   - `EmptyState`
   - `StatCard`
9. Crear paginas placeholder para:
   - productos
   - inventario
   - ventas
   - proveedores
   - alertas
10. Crear proteccion para que todas las rutas privadas requieran sesion y negocio.

## Navegacion sugerida

```ts
export const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    module: "dashboard"
  },
  {
    label: "Productos",
    href: "/productos",
    module: "products"
  },
  {
    label: "Inventario",
    href: "/inventario",
    module: "inventory"
  },
  {
    label: "Ventas",
    href: "/ventas",
    module: "sales"
  },
  {
    label: "Proveedores",
    href: "/proveedores",
    module: "suppliers"
  },
  {
    label: "Alertas",
    href: "/alertas",
    module: "alerts"
  }
];
```

## Archivos esperados

```txt
app/(app)/layout.tsx
app/(app)/dashboard/page.tsx
app/(app)/productos/page.tsx
app/(app)/inventario/page.tsx
app/(app)/ventas/page.tsx
app/(app)/proveedores/page.tsx
app/(app)/alertas/page.tsx
components/layout/app-sidebar.tsx
components/layout/app-header.tsx
components/layout/page-header.tsx
components/ui/empty-state.tsx
components/dashboard/stat-card.tsx
config/navigation.ts
lib/business/get-active-business.ts
```

## Criterios de aceptacion

- El panel privado tiene layout estable.
- El usuario ve el nombre de su negocio.
- El usuario ve su rubro.
- La navegacion funciona.
- Las paginas privadas no son accesibles sin sesion.
- La estructura queda lista para agregar modulos reales.

## Manual

Estas tareas puede tener que realizarlas el desarrollador:

- Revisar que el diseno se vea bien en escritorio.
- Verificar manualmente que las redirecciones no generen bucles.
- Probar cerrar sesion y volver a entrar.
- Confirmar que un usuario sin negocio sea enviado a onboarding.

---

# Fase 5 - Productos, categorias y proveedores

## Objetivo

Crear el modulo principal de productos junto con categorias y proveedores. Este sera el centro del sistema de inventario.

## Resultado esperado

Al finalizar esta fase, el usuario debe poder crear, listar, editar, buscar y desactivar productos. Tambien debe poder gestionar categorias y proveedores basicos.

## Campos comunes de producto

Todo producto debe tener:

- Nombre.
- Categoria.
- Proveedor opcional.
- SKU opcional.
- Codigo de barras opcional.
- Unidad de medida.
- Precio de costo.
- Precio de venta.
- Stock minimo.
- Stock actual.
- Estado activo/inactivo.

## Campos por rubro usando metadata

### Verduleria

```json
{
  "is_perishable": true,
  "expiration_days": 5,
  "allows_weight_sale": true,
  "waste_tracking": true
}
```

### Almacen

```json
{
  "fast_rotation": true,
  "suggested_margin": 30,
  "commercial_category": "Bebidas"
}
```

### Ferreteria

```json
{
  "brand": "Stanley",
  "model": "ABC123",
  "material": "Acero",
  "measure": "10mm",
  "technical_specs": "Uso profesional"
}
```

## Tareas para Cursor

1. Crear schemas de validacion con Zod para productos.
2. Crear schemas de validacion para categorias.
3. Crear schemas de validacion para proveedores.
4. Crear servicios o actions para:
   - listar productos
   - crear producto
   - editar producto
   - desactivar producto
   - obtener producto por id
5. Crear CRUD de categorias.
6. Crear CRUD de proveedores.
7. Crear formulario de producto.
8. Hacer que el formulario cambie segun `business_type`.
9. Guardar campos especificos del rubro dentro de `metadata`.
10. Crear tabla de productos con TanStack Table o una tabla simple inicial.
11. Agregar busqueda por nombre, SKU o codigo de barras.
12. Agregar filtros por categoria, proveedor y estado.
13. Crear vista de detalle de producto.
14. Evitar eliminar productos fisicamente; usar `active = false`.

## Rutas sugeridas

```txt
/productos
/productos/nuevo
/productos/[id]
/productos/[id]/editar
/proveedores
/proveedores/nuevo
/proveedores/[id]/editar
```

## Archivos esperados

```txt
app/(app)/productos/page.tsx
app/(app)/productos/nuevo/page.tsx
app/(app)/productos/[id]/page.tsx
app/(app)/productos/[id]/editar/page.tsx
app/(app)/proveedores/page.tsx
app/(app)/proveedores/nuevo/page.tsx
components/productos/product-form.tsx
components/productos/products-table.tsx
components/productos/product-business-fields.tsx
components/forms/category-form.tsx
components/forms/supplier-form.tsx
lib/validations/product.ts
lib/validations/category.ts
lib/validations/supplier.ts
modules/core/products/
modules/core/categories/
modules/core/suppliers/
```

## Reglas importantes

- `current_stock` puede cargarse al crear producto, pero debe generar movimiento inicial en la fase 6.
- En esta fase se puede guardar el stock actual, pero la logica completa de historial se termina en la fase 6.
- No borrar productos si tienen movimientos o ventas.
- Si un producto se desactiva, no debe aparecer en ventas futuras.

## Criterios de aceptacion

- Se pueden crear productos.
- Se pueden editar productos.
- Se pueden desactivar productos.
- Se pueden crear categorias.
- Se pueden crear proveedores.
- Los campos cambian segun el rubro.
- El producto guarda `business_id`.
- El producto guarda `business_type`.
- Los campos especificos se guardan en `metadata`.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Cargar categorias reales de prueba para cada rubro.
- Cargar proveedores reales o simulados.
- Probar productos de verduleria con kilos y productos perecibles.
- Probar productos de almacen con codigo de barras.
- Probar productos de ferreteria con marca, medida y especificaciones.
- Revisar que los precios y cantidades acepten decimales donde corresponda.

---

# Fase 6 - Inventario, movimientos y alertas iniciales

## Objetivo

Crear la logica central de inventario. Cada cambio de stock debe quedar registrado como movimiento.

## Resultado esperado

Al finalizar esta fase, el usuario debe poder ver el stock actual, registrar entradas, registrar salidas, hacer ajustes y consultar el historial de movimientos.

## Tipos de movimientos

```txt
initial_stock
purchase
adjustment
waste
return
sale
```

En esta fase se implementan:

- `initial_stock`
- `purchase`
- `adjustment`
- `waste`
- `return`

El tipo `sale` se implementa completamente en `arquitectura3.md`.

## Reglas de stock

- Las entradas aumentan stock.
- Las salidas disminuyen stock.
- Los ajustes pueden aumentar o disminuir stock.
- La merma disminuye stock y se usa especialmente en verdulerias.
- No permitir stock negativo salvo que se decida explicitamente.
- Cada movimiento debe guardar usuario creador.
- Cada movimiento debe guardar negocio.

## Tareas para Cursor

1. Crear servicios o actions para registrar movimientos.
2. Crear funcion central `createStockMovement`.
3. Actualizar `products.current_stock` al registrar un movimiento.
4. Registrar movimiento inicial cuando se crea producto con stock mayor a cero.
5. Crear pagina de inventario.
6. Mostrar listado de productos con stock actual.
7. Mostrar productos con bajo stock.
8. Crear formulario de movimiento de stock.
9. Permitir seleccionar producto.
10. Permitir elegir tipo de movimiento.
11. Validar cantidad segun unidad de medida.
12. Crear historial de movimientos.
13. Crear pagina de detalle de movimientos por producto.
14. Crear alertas iniciales de bajo stock.
15. Marcar alerta como resuelta cuando el stock vuelve a estar por encima del minimo.

## Rutas sugeridas

```txt
/inventario
/inventario/movimientos
/inventario/movimientos/nuevo
/inventario/productos/[id]/movimientos
/alertas
```

## Archivos esperados

```txt
app/(app)/inventario/page.tsx
app/(app)/inventario/movimientos/page.tsx
app/(app)/inventario/movimientos/nuevo/page.tsx
app/(app)/inventario/productos/[id]/movimientos/page.tsx
app/(app)/alertas/page.tsx
components/inventario/stock-movement-form.tsx
components/inventario/stock-table.tsx
components/inventario/movements-table.tsx
components/alertas/stock-alerts-list.tsx
lib/validations/stock-movement.ts
modules/core/inventory/
modules/core/stock-movements/
modules/core/alerts/
```

## Casos por rubro

### Verduleria

- Permitir cantidades decimales.
- Usar `kg` y `g`.
- Permitir movimiento `waste`.
- Mostrar merma como salida de stock.

### Almacen

- Priorizar control de stock minimo.
- Permitir codigo de barras para busqueda rapida.
- Mostrar productos de rotacion rapida si existen en `metadata`.

### Ferreteria

- Priorizar unidades enteras.
- Mostrar marca y medida si existen en `metadata`.
- Permitir busqueda por SKU, marca o especificacion.

## Criterios de aceptacion

- Se puede registrar entrada de stock.
- Se puede registrar ajuste de stock.
- Se puede registrar merma para verduleria.
- El stock actual del producto cambia correctamente.
- Cada cambio queda en `stock_movements`.
- Las alertas de bajo stock aparecen.
- El usuario solo ve movimientos de su negocio.
- No se permite stock negativo por error.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Probar movimientos con datos reales de cada rubro.
- Verificar manualmente que el stock se actualice bien.
- Revisar en Supabase que `stock_movements` guarde los datos correctos.
- Simular productos por debajo del stock minimo.
- Confirmar que las alertas aparezcan y se resuelvan correctamente.

## Checklist para pasar a arquitectura3.md

- Layout interno funcionando.
- Productos funcionando.
- Categorias funcionando.
- Proveedores funcionando.
- Campos por rubro funcionando.
- Inventario funcionando.
- Movimientos de stock funcionando.
- Alertas basicas funcionando.
