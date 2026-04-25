# Arquitectura 3 - Ventas, especializacion por rubro y cierre MVP

Este archivo contiene las fases 7, 8 y 9 del proyecto MultiStock. El objetivo es completar el flujo operativo del MVP: ventas basicas, descuento automatico de stock, personalizacion para verdulerias, almacenes y ferreterias, dashboard final, pruebas y deploy.

Antes de empezar este archivo deben estar completas las fases de `arquitectura1.md` y `arquitectura2.md`.

## Reglas para Cursor

- Mantener el foco en control de inventario.
- No implementar facturacion fiscal.
- No implementar caja avanzada.
- No implementar suscripciones ni pagos del SaaS todavia.
- Cada venta debe descontar stock.
- Cada descuento por venta debe generar un movimiento `sale`.
- Las diferencias por rubro deben apoyarse en configuracion y `metadata`.
- El MVP debe quedar simple, usable y presentable.

---

# Fase 7 - Ventas basicas con descuento de stock

## Objetivo

Crear el modulo de ventas basicas para registrar ventas simples y descontar stock automaticamente.

## Resultado esperado

Al finalizar esta fase, el usuario debe poder crear una venta, agregar productos, calcular total, guardar la venta y ver que el stock se descuenta.

## Alcance de ventas para MVP

Incluido:

- Nueva venta.
- Busqueda de productos.
- Agregar productos a la venta.
- Cantidad por unidad o peso.
- Calculo de subtotal.
- Calculo de total.
- Metodo de pago simple.
- Confirmar venta.
- Descontar stock.
- Crear movimiento de stock tipo `sale`.
- Ver historial basico de ventas.

No incluido:

- Facturacion fiscal.
- Impresion de tickets.
- Apertura y cierre de caja.
- Devoluciones avanzadas.
- Clientes frecuentes.
- Descuentos complejos.
- Integraciones externas.

## Metodos de pago iniciales

```txt
cash
debit
credit
transfer
other
```

## Tareas para Cursor

1. Crear schema de validacion para ventas.
2. Crear schema de validacion para items de venta.
3. Crear pagina de ventas.
4. Crear pagina de nueva venta.
5. Crear buscador de productos activos.
6. Permitir agregar producto al carrito de venta.
7. Permitir modificar cantidad.
8. Permitir quitar producto de la venta.
9. Calcular subtotal por item.
10. Calcular total general.
11. Validar stock disponible antes de confirmar.
12. Insertar registro en `sales`.
13. Insertar registros en `sale_items`.
14. Crear un movimiento `sale` por cada item vendido.
15. Descontar stock del producto.
16. Actualizar alertas de bajo stock si corresponde.
17. Crear vista de detalle de venta.
18. Crear historial de ventas.

## Rutas sugeridas

```txt
/ventas
/ventas/nueva
/ventas/[id]
```

## Archivos esperados

```txt
app/(app)/ventas/page.tsx
app/(app)/ventas/nueva/page.tsx
app/(app)/ventas/[id]/page.tsx
components/ventas/sale-form.tsx
components/ventas/product-search.tsx
components/ventas/sale-items-table.tsx
components/ventas/sales-table.tsx
components/ventas/sale-summary.tsx
lib/validations/sale.ts
modules/core/sales/
```

## Reglas de negocio

- No vender productos inactivos.
- No vender cantidades mayores al stock disponible.
- Para verduleria, permitir cantidades decimales si el producto usa `kg` o `g`.
- Para almacen, priorizar busqueda por codigo de barras si existe.
- Para ferreteria, mostrar marca, medida o SKU para evitar confusiones.
- Si falla la venta, no debe quedar stock descontado parcialmente.
- La venta y los movimientos deben ser consistentes.

## Casos por rubro

### Verduleria

- Permitir vender 0.5 kg, 1.25 kg, etc.
- Mostrar unidad de medida claramente.
- Descontar stock decimal.

### Almacen

- Permitir busqueda rapida por codigo.
- Mostrar productos de alta rotacion primero si se implementa en metadata.

### Ferreteria

- Mostrar SKU, marca y medida en la busqueda.
- Evitar vender productos tecnicamente parecidos sin identificacion clara.

## Criterios de aceptacion

- Se puede crear una venta.
- Se pueden agregar varios productos.
- El total se calcula correctamente.
- El stock se descuenta al confirmar.
- Se crea movimiento `sale`.
- No se permite vender mas que el stock disponible.
- El historial de ventas queda visible.
- La venta solo pertenece al negocio activo.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Probar ventas con productos de verduleria por peso.
- Probar ventas de almacen con productos de alta rotacion.
- Probar ventas de ferreteria con productos tecnicos.
- Revisar en Supabase que `sales`, `sale_items` y `stock_movements` queden consistentes.
- Simular una venta que deja un producto bajo minimo para confirmar que se genera alerta.

---

# Fase 8 - Personalizacion real por rubro

## Objetivo

Mejorar la experiencia de cada tipo de negocio sin romper el nucleo comun del sistema.

## Resultado esperado

Al finalizar esta fase, verdulerias, almacenes y ferreterias deben tener formularios, listados, metricas y acciones especificas segun su rubro.

## Principio de implementacion

La personalizacion debe depender de:

- `business_type`
- `config/business-types.ts`
- `metadata` en productos
- componentes especificos por rubro cuando sea necesario

No crear bases de datos separadas ni modulos duplicados completos.

## Tareas generales para Cursor

1. Revisar `config/business-types.ts`.
2. Crear helpers para obtener campos por rubro.
3. Crear componentes de campos especificos:
   - `VerduleriaProductFields`
   - `AlmacenProductFields`
   - `FerreteriaProductFields`
4. Crear componentes de resumen por rubro.
5. Mejorar listados para mostrar columnas relevantes segun rubro.
6. Mejorar dashboard para mostrar tarjetas segun rubro.
7. Agregar filtros especificos por rubro.
8. Mantener validaciones por rubro usando Zod.
9. Documentar en comentarios breves donde este la logica modular.

## Verduleria

### Objetivo especifico

Adaptar el sistema para productos perecibles, venta por peso y merma.

### Tareas para Cursor

1. Agregar campos de producto:
   - producto perecible
   - dias de vida util
   - permite venta por peso
   - controla merma
2. Mostrar unidad `kg` o `g` de forma clara.
3. Permitir movimientos de merma desde inventario.
4. Mostrar total de merma reciente.
5. Crear alerta para productos perecibles si se define vida util.
6. En ventas, permitir cantidades decimales.
7. En dashboard, mostrar:
   - productos bajo stock
   - productos perecibles
   - merma reciente
   - ventas del dia

### Criterios de aceptacion

- Un producto puede marcarse como perecible.
- Un producto puede venderse por peso.
- Se puede registrar merma.
- La merma descuenta stock.
- Las cantidades decimales funcionan correctamente.

## Almacen

### Objetivo especifico

Adaptar el sistema para productos de rotacion rapida, margenes y categorias comerciales.

### Tareas para Cursor

1. Agregar campos de producto:
   - producto de alta rotacion
   - margen sugerido
   - categoria comercial
2. Calcular margen simple entre costo y venta.
3. Mostrar productos con margen bajo si corresponde.
4. Destacar productos de alta rotacion.
5. En ventas, facilitar busqueda por codigo de barras.
6. En dashboard, mostrar:
   - ventas del dia
   - productos bajo stock
   - productos de alta rotacion
   - margen promedio simple

### Criterios de aceptacion

- Un producto puede marcarse como alta rotacion.
- El sistema muestra margen estimado.
- La busqueda por codigo funciona si existe `barcode`.
- El dashboard muestra datos utiles para almacen.

## Ferreteria

### Objetivo especifico

Adaptar el sistema para productos tecnicos con marca, modelo, medidas y especificaciones.

### Tareas para Cursor

1. Agregar campos de producto:
   - marca
   - modelo
   - medida
   - material
   - especificaciones tecnicas
2. Mostrar datos tecnicos en listado de productos.
3. Permitir busqueda por SKU, marca, modelo o medida.
4. Preparar estructura para variantes simples, sin crear complejidad excesiva.
5. En ventas, mostrar datos tecnicos para elegir bien el producto.
6. En dashboard, mostrar:
   - productos bajo stock
   - productos sin movimiento reciente
   - productos por categoria
   - total de productos activos

### Criterios de aceptacion

- Un producto puede tener datos tecnicos.
- La busqueda encuentra productos por marca o medida.
- El listado ayuda a diferenciar productos similares.
- El dashboard muestra informacion relevante para ferreteria.

## Archivos esperados

```txt
modules/verduleria/
modules/verduleria/product-fields.tsx
modules/verduleria/dashboard-cards.tsx
modules/almacen/
modules/almacen/product-fields.tsx
modules/almacen/dashboard-cards.tsx
modules/ferreteria/
modules/ferreteria/product-fields.tsx
modules/ferreteria/dashboard-cards.tsx
lib/business/business-type-config.ts
```

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Cargar datos de prueba realistas para cada rubro.
- Revisar si los campos especificos son suficientes para usuarios reales.
- Probar formularios cambiando de negocio o creando negocios de distintos rubros.
- Validar que una mejora para un rubro no rompa los otros.
- Decidir si algun campo de `metadata` merece pasar a columna real en el futuro.

---

# Fase 9 - Dashboard final, pruebas, pulido y deploy MVP

## Objetivo

Cerrar el MVP con una experiencia estable, clara y presentable para probar con usuarios reales.

## Resultado esperado

Al finalizar esta fase, MultiStock debe tener un flujo completo desde registro hasta gestion de inventario y ventas.

## Flujo completo a validar

1. Usuario se registra.
2. Usuario crea negocio.
3. Usuario selecciona rubro.
4. Usuario crea categorias.
5. Usuario crea proveedores.
6. Usuario crea productos.
7. Usuario registra stock inicial.
8. Usuario registra movimientos de stock.
9. Usuario registra ventas.
10. Sistema descuenta stock.
11. Sistema genera alertas.
12. Usuario consulta dashboard.

## Dashboard MVP

El dashboard debe mostrar tarjetas simples y utiles.

### Comun para todos

- Total de productos activos.
- Productos bajo stock.
- Ventas del dia.
- Movimientos recientes.
- Alertas pendientes.

### Verduleria

- Merma reciente.
- Productos perecibles.
- Productos vendidos por peso.

### Almacen

- Productos de alta rotacion.
- Margen promedio simple.
- Productos mas vendidos.

### Ferreteria

- Productos tecnicos bajo stock.
- Productos sin movimiento reciente.
- Categorias principales.

## Tareas para Cursor

1. Mejorar dashboard general.
2. Agregar tarjetas por rubro.
3. Crear consultas resumidas para metricas.
4. Mejorar estados vacios.
5. Mejorar mensajes de error.
6. Mejorar loaders.
7. Revisar formularios con validaciones.
8. Revisar permisos y filtros por `business_id`.
9. Revisar RLS en Supabase.
10. Agregar datos seed opcionales si conviene.
11. Probar flujo completo.
12. Corregir errores detectados.
13. Preparar build de produccion.
14. Preparar deploy en Vercel.

## Pruebas recomendadas

### Pruebas funcionales

- Registro de usuario.
- Login.
- Creacion de negocio.
- Seleccion de rubro.
- Creacion de producto.
- Edicion de producto.
- Desactivacion de producto.
- Creacion de proveedor.
- Movimiento de entrada.
- Movimiento de ajuste.
- Movimiento de merma.
- Venta.
- Descuento de stock.
- Generacion de alerta.
- Dashboard.

### Pruebas por rubro

Verduleria:

- Producto por kilo.
- Venta decimal.
- Merma.
- Producto perecible.

Almacen:

- Producto con codigo de barras.
- Producto de alta rotacion.
- Margen.
- Venta rapida.

Ferreteria:

- Producto con marca.
- Producto con medida.
- Producto con especificaciones.
- Busqueda tecnica.

### Pruebas de seguridad

- Un usuario no debe ver negocios ajenos.
- Un usuario no debe ver productos de otro negocio.
- Un usuario no debe modificar ventas de otro negocio.
- Las consultas deben filtrar por `business_id`.
- RLS debe bloquear accesos invalidos.

## Criterios de aceptacion del MVP

- El flujo completo funciona sin errores criticos.
- La app puede usarse como control de inventario basico.
- Los tres rubros tienen diferencias reales.
- Los datos se guardan correctamente en Supabase.
- El stock se mantiene consistente.
- Las ventas descuentan stock.
- Las alertas aparecen cuando corresponde.
- El dashboard aporta informacion util.
- La app se puede desplegar en Vercel.

## Manual

Estas tareas debe hacerlas el desarrollador:

- Crear proyecto en Vercel.
- Conectar el repositorio a Vercel.
- Configurar variables de entorno en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- Configurar URLs de redirect en Supabase Auth para produccion.
- Ejecutar pruebas manuales en produccion.
- Cargar datos de prueba.
- Probar el flujo completo en un navegador limpio.
- Revisar que no haya claves privadas expuestas.
- Definir si el MVP se compartira con usuarios de prueba.

## Pendientes fuera del MVP

No implementar en estas fases salvo que se solicite explicitamente:

- Facturacion.
- Control de caja.
- Multi-sucursal.
- Reportes avanzados.
- Exportacion a Excel o PDF.
- Escaner real de codigo de barras.
- Impresion de tickets.
- Suscripciones pagas.
- Roles avanzados.
- Auditoria detallada.
- App movil.

## Checklist final

- `arquitectura1.md` completado.
- `arquitectura2.md` completado.
- Ventas basicas funcionando.
- Personalizacion por rubro funcionando.
- Dashboard funcionando.
- Alertas funcionando.
- Seguridad revisada.
- Build de produccion correcto.
- Deploy funcionando.
- MVP listo para prueba real.
