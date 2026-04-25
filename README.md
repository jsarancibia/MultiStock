# MultiStock

MultiStock es una aplicacion web SaaS de control de inventario para pequenos negocios, modular y especializada por rubro.

El objetivo del proyecto es construir un sistema simple, profesional y escalable para comercios que necesitan ordenar su stock, registrar ventas basicas y tomar mejores decisiones sin depender de software complejo.

## Vision del Producto

MultiStock no sera un sistema distinto para cada tipo de comercio. La plataforma tendra un nucleo comun de inventario y una capa de personalizacion segun el rubro elegido por el usuario.

Rubros iniciales:

- Verdulerias
- Almacenes
- Ferreterias

Cada negocio compartira la misma base tecnica, pero vera campos, modulos, dashboards y flujos adaptados a su actividad.

## Objetivos Principales

- Crear una plataforma SaaS simple y profesional.
- Mantener una arquitectura modular y escalable.
- Usar tecnologias modernas con planes gratuitos al inicio.
- Construir primero un MVP funcional antes de sumar complejidad.
- Permitir que el producto pueda crecer hacia una solucion comercial real.

## Stack Inicial

- Frontend: Next.js
- Backend: Supabase
- Base de datos: PostgreSQL
- Autenticacion: Supabase Auth
- Deploy: Vercel
- UI: Tailwind CSS y shadcn/ui
- Validaciones: Zod
- Formularios: React Hook Form
- Tablas: TanStack Table
- Graficos: Recharts

## Concepto General

Flujo esperado:

1. El usuario entra a la plataforma.
2. Se registra o inicia sesion.
3. Crea su negocio.
4. Selecciona el tipo de negocio.
5. Accede a una version personalizada del sistema.
6. Gestiona productos, stock, ventas, proveedores y alertas.

La personalizacion se define por configuracion, no por sistemas separados. Esto permite mantener un solo codigo base y activar modulos o campos segun el rubro.

## Rubros Soportados

### Verduleria

Necesidades principales:

- Venta por peso.
- Productos perecibles.
- Manejo de merma.
- Control de vencimiento o vida util.
- Alertas por bajo stock y productos sensibles.

Ejemplos de campos especificos:

- Permite venta por peso.
- Dias estimados de conservacion.
- Porcentaje o cantidad de merma.
- Unidad principal: kilo, gramo, unidad, cajon.

### Almacen

Necesidades principales:

- Productos de rotacion rapida.
- Categorias comerciales.
- Margenes de ganancia.
- Control de stock minimo.
- Registro de ventas simples.

Ejemplos de campos especificos:

- Margen sugerido.
- Categoria comercial.
- Producto de alta rotacion.
- Codigo de barras.

### Ferreteria

Necesidades principales:

- Productos tecnicos.
- Variantes.
- Marcas.
- Medidas y especificaciones.
- Stock por unidades.

Ejemplos de campos especificos:

- Marca.
- Modelo.
- Medida.
- Material.
- Especificaciones tecnicas.
- Variantes del producto.

## Arquitectura General

La aplicacion se organizara en capas.

### 1. Core SaaS

Responsable de la estructura base del producto.

- Autenticacion.
- Usuarios.
- Negocios.
- Roles.
- Configuracion del negocio.
- Tipo de rubro seleccionado.

### 2. Core de Inventario

Responsable de la logica comun a todos los comercios.

- Productos.
- Categorias.
- Proveedores.
- Stock actual.
- Movimientos de stock.
- Ventas basicas.
- Alertas de stock.
- Dashboard general.

### 3. Modulos por Rubro

Responsable de adaptar la experiencia segun el negocio.

- Modulo verduleria.
- Modulo almacen.
- Modulo ferreteria.

Cada modulo podra definir:

- Campos extra de producto.
- Reglas de inventario.
- Secciones visibles.
- Metricas del dashboard.
- Acciones especificas.

### 4. UI Personalizada

Responsable de mostrar una experiencia profesional y adaptada.

- Navegacion segun rubro.
- Formularios dinamicos.
- Tarjetas de metricas.
- Tablas.
- Alertas.
- Dashboards.

## Estructura Propuesta del Proyecto

```txt
multistock/
├─ app/
│  ├─ page.tsx
│  ├─ auth/
│  ├─ onboarding/
│  ├─ dashboard/
│  ├─ productos/
│  ├─ inventario/
│  ├─ ventas/
│  ├─ proveedores/
│  └─ alertas/
│
├─ components/
│  ├─ ui/
│  ├─ layout/
│  ├─ dashboard/
│  ├─ productos/
│  └─ forms/
│
├─ modules/
│  ├─ core/
│  ├─ verduleria/
│  ├─ almacen/
│  └─ ferreteria/
│
├─ lib/
│  ├─ supabase/
│  ├─ auth/
│  ├─ business/
│  └─ validations/
│
├─ config/
│  ├─ business-types.ts
│  ├─ navigation.ts
│  └─ modules.ts
│
├─ types/
│  ├─ database.ts
│  ├─ product.ts
│  ├─ business.ts
│  └─ stock.ts
│
└─ docs/
   ├─ architecture.md
   ├─ database.md
   └─ roadmap.md
```

## Modelo de Datos Inicial

La base de datos debe estar preparada para multiples negocios y usuarios desde el inicio.

### profiles

Guarda informacion basica del usuario.

Campos sugeridos:

- id
- full_name
- email
- created_at

### businesses

Representa el comercio del usuario.

Campos sugeridos:

- id
- owner_id
- name
- business_type
- created_at

Valores iniciales para `business_type`:

- `verduleria`
- `almacen`
- `ferreteria`

### business_users

Permite que en el futuro un negocio tenga varios usuarios.

Campos sugeridos:

- id
- business_id
- user_id
- role
- created_at

Roles iniciales:

- owner
- admin
- staff

### categories

Categorias de productos por negocio.

Campos sugeridos:

- id
- business_id
- name
- business_type
- created_at

### products

Tabla central del inventario.

Campos sugeridos:

- id
- business_id
- category_id
- supplier_id
- name
- sku
- barcode
- unit_type
- cost_price
- sale_price
- min_stock
- current_stock
- business_type
- metadata
- active
- created_at
- updated_at

El campo `metadata` sera de tipo `jsonb` y permitira guardar campos especificos por rubro durante el MVP.

Ejemplo para verduleria:

```json
{
  "is_perishable": true,
  "expiration_days": 5,
  "allows_weight_sale": true,
  "waste_tracking": true
}
```

Ejemplo para ferreteria:

```json
{
  "brand": "Stanley",
  "technical_specs": {
    "size": "10mm",
    "material": "Acero"
  },
  "has_variants": true
}
```

### suppliers

Proveedores del negocio.

Campos sugeridos:

- id
- business_id
- name
- phone
- email
- address
- created_at

### stock_movements

Historial de entradas y salidas de stock.

Campos sugeridos:

- id
- business_id
- product_id
- type
- quantity
- reason
- unit_cost
- created_by
- created_at

Tipos iniciales de movimiento:

- `purchase`
- `sale`
- `adjustment`
- `waste`
- `return`
- `initial_stock`

### sales

Registro de ventas.

Campos sugeridos:

- id
- business_id
- total
- payment_method
- created_by
- created_at

### sale_items

Detalle de productos vendidos.

Campos sugeridos:

- id
- sale_id
- product_id
- quantity
- unit_price
- subtotal

### stock_alerts

Alertas generadas por el sistema.

Campos sugeridos:

- id
- business_id
- product_id
- type
- message
- resolved
- created_at

Tipos iniciales:

- `low_stock`
- `out_of_stock`
- `perishable_warning`
- `waste_warning`

## Seguridad y Multi-Tenancy

Desde el inicio, MultiStock debe considerar que varios negocios usaran la misma plataforma.

Principios:

- Cada tabla operativa debe tener `business_id`.
- Los usuarios solo pueden acceder a datos de sus negocios.
- Supabase debe usar Row Level Security.
- Las reglas deben validarse desde la base de datos, no solo desde el frontend.
- El propietario del negocio debe tener permisos completos.
- Los roles secundarios se pueden agregar progresivamente.

## Configuracion por Rubro

La personalizacion debe manejarse con configuraciones centralizadas.

Ejemplo conceptual:

```ts
export const businessTypes = {
  verduleria: {
    label: "Verduleria",
    modules: ["products", "inventory", "sales", "suppliers", "waste"],
    productFields: ["expiration", "weight_sale", "waste_enabled"],
    dashboard: "verduleria"
  },
  almacen: {
    label: "Almacen",
    modules: ["products", "inventory", "sales", "suppliers", "margins"],
    productFields: ["category_margin", "fast_rotation"],
    dashboard: "almacen"
  },
  ferreteria: {
    label: "Ferreteria",
    modules: ["products", "inventory", "sales", "suppliers", "technical_specs"],
    productFields: ["brand", "variant", "technical_specs"],
    dashboard: "ferreteria"
  }
};
```

## Roadmap por Fases

### Fase 0 - Planificacion del Producto

Objetivo: definir el alcance inicial y dejar documentada la arquitectura base.

Tareas:

- Definir vision del producto.
- Definir rubros iniciales.
- Definir modulos core.
- Definir modelo de datos inicial.
- Definir estructura del proyecto.
- Definir stack tecnico.
- Definir fases del MVP.

Resultado esperado:

- README del proyecto.
- Documentacion inicial de arquitectura.
- Roadmap claro de implementacion.

Estado: en progreso.

### Fase 1 - Setup Tecnico

Objetivo: crear la base tecnica del proyecto.

Tareas:

- Crear proyecto con Next.js.
- Configurar TypeScript.
- Configurar Tailwind CSS.
- Instalar shadcn/ui.
- Configurar Supabase.
- Crear variables de entorno.
- Configurar estructura de carpetas.
- Preparar cliente de Supabase para frontend y servidor.
- Configurar deploy inicial en Vercel.

Resultado esperado:

- Aplicacion base corriendo localmente.
- Proyecto conectado a Supabase.
- Deploy inicial funcionando.

Version sugerida: `v0.1.0`.

### Fase 2 - Autenticacion y Onboarding

Objetivo: permitir que un usuario cree su cuenta y configure su negocio.

Tareas:

- Crear registro e inicio de sesion.
- Crear pantalla de onboarding.
- Crear formulario para datos del negocio.
- Permitir seleccion de rubro.
- Guardar negocio en la base de datos.
- Asociar usuario propietario al negocio.
- Redirigir al dashboard correspondiente.

Resultado esperado:

- Usuario puede registrarse.
- Usuario puede crear un negocio.
- El sistema recuerda el rubro seleccionado.

Version sugerida: `v0.2.0`.

### Fase 3 - Core de Productos

Objetivo: crear el primer modulo operativo del sistema.

Tareas:

- Crear tabla de productos.
- Crear tabla de categorias.
- Crear formulario de producto.
- Crear listado de productos.
- Crear edicion de producto.
- Crear baja logica con campo `active`.
- Agregar campos comunes.
- Agregar campos dinamicos segun rubro usando `metadata`.

Resultado esperado:

- El usuario puede crear, ver, editar y desactivar productos.
- El formulario cambia segun el rubro del negocio.

Version sugerida: `v0.3.0`.

### Fase 4 - Inventario y Movimientos de Stock

Objetivo: controlar entradas, salidas y ajustes de inventario.

Tareas:

- Crear tabla de movimientos de stock.
- Registrar stock inicial.
- Registrar entradas por compra.
- Registrar salidas manuales.
- Registrar ajustes.
- Actualizar stock actual del producto.
- Mostrar historial de movimientos.
- Validar movimientos segun unidad de medida.

Resultado esperado:

- Cada cambio de stock queda registrado.
- El usuario puede consultar historial por producto.
- El stock actual se mantiene actualizado.

Version sugerida: `v0.4.0`.

### Fase 5 - Proveedores

Objetivo: permitir la gestion basica de proveedores.

Tareas:

- Crear tabla de proveedores.
- Crear formulario de proveedor.
- Crear listado de proveedores.
- Asociar proveedor a productos.
- Permitir filtrar productos por proveedor.

Resultado esperado:

- El usuario puede administrar proveedores.
- Los productos pueden vincularse a un proveedor.

Version sugerida: `v0.5.0`.

### Fase 6 - Ventas Basicas

Objetivo: registrar ventas simples y descontar stock automaticamente.

Tareas:

- Crear tabla de ventas.
- Crear tabla de items de venta.
- Crear pantalla de nueva venta.
- Buscar productos.
- Agregar productos a la venta.
- Calcular subtotal y total.
- Registrar metodo de pago.
- Descontar stock al confirmar venta.
- Crear movimiento de stock tipo `sale`.

Resultado esperado:

- El usuario puede registrar una venta.
- El sistema descuenta stock.
- Queda historial de venta y movimiento.

Version sugerida: `v0.6.0`.

### Fase 7 - Dashboard y Alertas

Objetivo: mostrar informacion util del negocio.

Tareas:

- Crear dashboard general.
- Mostrar cantidad total de productos.
- Mostrar productos con bajo stock.
- Mostrar ventas del dia.
- Mostrar movimientos recientes.
- Crear alertas de stock minimo.
- Crear alertas especificas por rubro.

Resultado esperado:

- El usuario ve rapidamente el estado del negocio.
- El sistema advierte problemas de stock.

Version sugerida: `v0.7.0`.

### Fase 8 - Personalizacion por Rubro

Objetivo: mejorar la experiencia especializada de cada tipo de negocio.

Tareas para verduleria:

- Mejorar venta por peso.
- Registrar merma.
- Mostrar productos perecibles.
- Alertar productos sensibles por vida util.

Tareas para almacen:

- Marcar productos de alta rotacion.
- Mostrar margenes por producto.
- Mejorar categorias comerciales.
- Destacar productos mas vendidos.

Tareas para ferreteria:

- Agregar especificaciones tecnicas.
- Agregar marcas.
- Agregar variantes simples.
- Mejorar busqueda por datos tecnicos.

Resultado esperado:

- Cada rubro tiene una experiencia diferenciada.
- El sistema mantiene un nucleo comun.

Version sugerida: `v0.8.0`.

### Fase 9 - MVP Cerrado

Objetivo: estabilizar la primera version usable del producto.

Tareas:

- Revisar flujos completos.
- Corregir errores.
- Mejorar UI.
- Mejorar mensajes vacios.
- Mejorar validaciones.
- Revisar permisos de Supabase.
- Probar con datos reales simulados.
- Preparar demo funcional.

Resultado esperado:

- MVP listo para mostrar a usuarios reales.
- Flujo completo desde registro hasta ventas y control de stock.

Version sugerida: `v1.0.0`.

## Funcionalidades Fuera del MVP

Estas funcionalidades pueden agregarse despues de validar el producto:

- Facturacion.
- Control de caja.
- Multi-sucursal.
- Reportes avanzados.
- Exportacion a Excel o PDF.
- Escaner de codigo de barras.
- Integraciones con impresoras.
- Planes pagos.
- Suscripciones.
- Auditoria avanzada.
- Gestion avanzada de roles.
- App movil.

## Prioridades del MVP

Orden recomendado:

1. Autenticacion.
2. Creacion de negocio.
3. Seleccion de rubro.
4. Productos.
5. Inventario.
6. Movimientos de stock.
7. Proveedores.
8. Ventas basicas.
9. Alertas.
10. Dashboard.
11. Personalizacion por rubro.

## Principios de Desarrollo

- Mantener codigo simple y legible.
- Evitar abstracciones innecesarias al inicio.
- Separar logica core de logica especifica por rubro.
- Usar componentes reutilizables.
- Validar datos con Zod.
- Proteger datos con Row Level Security.
- Pensar en escalabilidad, pero construir por etapas.
- Priorizar flujos completos antes que funcionalidades avanzadas.

## Convenciones Iniciales

### Nombres de Rutas

Usar rutas en espanol para la interfaz principal:

- `/dashboard`
- `/productos`
- `/inventario`
- `/ventas`
- `/proveedores`
- `/alertas`
- `/onboarding`

### Nombres Internos

Usar nombres internos consistentes en ingles para codigo, tablas y enums:

- `products`
- `stock_movements`
- `businesses`
- `suppliers`
- `sales`
- `business_type`

### Unidades de Medida Iniciales

- `unit`
- `kg`
- `g`
- `box`
- `liter`
- `meter`

## Criterios de Exito del MVP

El MVP se considera exitoso si permite:

- Registrar un usuario.
- Crear un negocio.
- Seleccionar un rubro.
- Crear productos adaptados al rubro.
- Registrar stock inicial.
- Registrar movimientos de stock.
- Registrar proveedores.
- Registrar ventas simples.
- Descontar stock automaticamente.
- Ver alertas de bajo stock.
- Consultar un dashboard basico.

## Estado Actual

El proyecto se encuentra en etapa de planificacion inicial.

Proximo paso recomendado:

1. Crear el proyecto Next.js.
2. Configurar Supabase.
3. Crear la estructura base de carpetas.
4. Documentar el modelo SQL inicial.
5. Comenzar con autenticacion y onboarding.
