# Arquitectura 6 - Roadmap v1/v2 y crecimiento controlado

Este archivo contiene las fases 16, 17 y 18 de MultiStock. El objetivo es ordenar el crecimiento futuro sin mezclarlo con el MVP actual.

La regla es clara: primero consolidar el producto actual, despues avanzar a v1 y finalmente a v2.

## Roadmap general

```txt
MVP actual
- inventario
- ventas basicas
- alertas
- dashboard
- personalizacion por rubro

v1
- codigo de barras
- reportes simples
- exportaciones
- selector multi-negocio
- auditoria visible

v2
- cafeterias
- caja
- sucursales
- roles avanzados
- SaaS comercial
```

---

# Fase 16 - v1: productividad operativa

## Objetivo

Agregar mejoras de productividad sin cambiar el nucleo del sistema.

## Resultado esperado

MultiStock v1 debe ser mas rapido para operar, mas facil de analizar y mas util para comercios reales.

## Funcionalidades candidatas v1

Incluido:

- Codigo de barras.
- Reportes simples.
- Exportaciones CSV.
- Selector multi-negocio.
- Auditoria visible.
- Mejor busqueda global.

No incluido:

- Facturacion fiscal.
- Caja avanzada.
- Sucursales.
- Suscripciones reales.

## Codigo de barras

Objetivo:

- Permitir busqueda rapida por codigo.
- Preparar lectura con scanner USB como teclado.
- No implementar app movil ni scanner de camara todavia.

Tareas:

1. Mejorar foco automatico en buscador de ventas.
2. Priorizar coincidencia exacta de `barcode`.
3. Agregar atajo de teclado para nueva venta.
4. Agregar confirmacion rapida cuando hay una coincidencia exacta.
5. Agregar validacion de barcode duplicado por negocio.

## Reportes simples

Reportes iniciales:

- Ventas por dia.
- Productos mas vendidos.
- Productos bajo stock.
- Movimientos por periodo.
- Merma por periodo.

No hacer:

- BI complejo.
- Dashboards configurables.
- Graficos avanzados.

## Exportaciones

Exportar:

- Productos.
- Inventario.
- Movimientos.
- Ventas.
- Alertas.

Formato inicial:

- CSV.

Luego:

- PDF o Excel.

## Selector multi-negocio

Objetivo:

- Permitir a un usuario cambiar entre negocios donde tenga membresia.

Tareas:

1. Listar negocios del usuario.
2. Guardar negocio activo.
3. Permitir cambio desde header.
4. Ajustar `requireActiveBusiness`.
5. Mantener filtros por `business_id`.

## Archivos esperados

```txt
components/layout/business-switcher.tsx
lib/business/active-business-cookie.ts
modules/core/reports/
app/(app)/reportes/page.tsx
app/(app)/exportaciones/page.tsx
```

## Criterios de aceptacion

- El usuario puede operar ventas mas rapido con codigo.
- Puede exportar productos e inventario a CSV.
- Puede ver reportes simples.
- Puede cambiar de negocio si tiene mas de uno.

---

# Fase 17 - v2: nuevos rubros, caja simple y sucursales

## Objetivo

Preparar el salto de MultiStock a negocios mas complejos sin romper el core.

## Resultado esperado

MultiStock debe poder crecer hacia nuevos rubros y operaciones de caja/sucursal, pero de forma progresiva.

## Nuevo rubro candidato: cafeterias

Por que cafeterias:

- Tienen inventario.
- Tienen venta rapida.
- Tienen productos preparados.
- Pueden necesitar insumos.
- Son cercanas a almacenes pero con logica propia.

Campos posibles:

- producto preparado
- receta simple
- insumo principal
- unidad de preparacion
- margen estimado

No implementar todavia:

- recetas complejas
- cocina
- comandas
- mesas

## Caja simple

Objetivo:

- Registrar ingresos y egresos simples.

Incluido:

- Apertura de caja simple.
- Cierre de caja simple.
- Total esperado.
- Total declarado.
- Diferencia.

No incluido:

- Facturacion.
- Integraciones fiscales.
- Arqueos avanzados.

## Sucursales

Objetivo:

- Permitir que un negocio tenga mas de una ubicacion.

Modelo sugerido:

```txt
branches
id
business_id
name
address
active
created_at
```

Impacto:

- productos pueden seguir siendo globales
- stock podria pasar a ser por sucursal
- movimientos deben indicar sucursal
- ventas deben indicar sucursal

Advertencia:

Multi-sucursal cambia el modelo de inventario. No implementarlo hasta que el MVP y v1 esten estables.

## Tareas para Cursor

1. Documentar cambios de modelo antes de tocar DB.
2. Crear arquitectura especifica para sucursales.
3. Evaluar si `products.current_stock` debe migrar a tabla `branch_stock`.
4. Crear rubro `cafeteria` en configuracion solo cuando se decida implementar.
5. Crear modulos nuevos sin duplicar core.

## Criterios de aceptacion

- El roadmap de v2 no rompe el MVP.
- Las sucursales tienen diseno previo claro.
- La caja simple no se confunde con facturacion.
- Cafeteria se modela como rubro, no como app separada.

---

# Fase 18 - SaaS comercial y preparacion para negocio real

## Objetivo

Preparar MultiStock para operar como producto comercial si el MVP valida con usuarios reales.

## Resultado esperado

Debe existir una base para cobrar, administrar planes, gestionar limites y operar soporte.

## Funcionalidades candidatas

- Planes y limites.
- Suscripciones.
- Roles avanzados.
- Invitacion de usuarios.
- Panel de administracion interno.
- Onboarding guiado.
- Emails transaccionales.
- Soporte basico.

## Planes posibles

```txt
Starter
- 1 negocio
- 1 usuario
- productos limitados

Pro
- 1 negocio
- varios usuarios
- exportaciones
- auditoria visible

Business
- multi-negocio o sucursales
- roles avanzados
- reportes avanzados
```

## No implementar antes de validar

- Pagos reales.
- Suscripciones automaticas.
- Integraciones complejas.
- Facturacion fiscal.

## Requisitos tecnicos

- Tabla `plans`.
- Tabla `subscriptions`.
- Tabla `usage_limits`.
- Tabla `invitations`.
- Roles mas finos.
- Control por feature flag.

## Tareas para Cursor

1. Crear documento de modelo SaaS.
2. Definir planes sin implementar pagos.
3. Definir limites por plan.
4. Definir roles:
   - owner
   - admin
   - staff
   - viewer
5. Preparar feature flags.
6. Crear panel interno solo si es necesario.
7. Evaluar proveedor de pagos cuando haya validacion real.

## Criterios de aceptacion

- Hay estrategia comercial clara.
- La arquitectura soporta planes futuros.
- No se agregan pagos antes de validar.
- El producto sigue funcionando aunque no haya suscripcion real.

## Manual

Estas decisiones son de producto/negocio:

- Precio real.
- Plan gratuito o trial.
- Publico objetivo inicial.
- Rubros prioritarios.
- Soporte ofrecido.
- Condiciones comerciales.
