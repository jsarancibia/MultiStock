# Arquitectura 14 - Scanner de códigos de barras mobile-first

Este documento define la implementación de lectura de códigos de barras en MultiStock usando la cámara del celular desde navegador web. La solución debe integrarse con la arquitectura actual sin romper los flujos existentes de productos, ventas e inventario.

## 1. Objetivo

Permitir que el usuario use la cámara del celular para escanear códigos de barras y acelerar tareas operativas:

- Registrar productos más rápido desde el formulario de producto.
- Guardar el código de barras normalizado en base de datos.
- Buscar productos por código escaneado durante una venta.
- Agregar automáticamente productos al carrito de venta.
- Seleccionar automáticamente productos en movimientos de stock.

La experiencia debe ser mobile-first, simple y usable desde navegador móvil, sin requerir app nativa.

## 2. Alcance

Incluido:

- Scanner web con cámara usando `getUserMedia`.
- UI tipo modal o fullscreen para mobile.
- Botón `Escanear código` en formularios y buscadores donde corresponda.
- Lectura de códigos comunes de comercio.
- Normalización y validación de códigos de barras.
- Integración con productos, ventas e inventario.
- Búsqueda por `barcode` filtrada por `business_id`.
- Manejo de errores de cámara, permisos y códigos inválidos.
- Cleanup correcto de cámara al cerrar.

No incluido en esta fase:

- App móvil nativa.
- Escáner físico USB/Bluetooth dedicado.
- Integración con bases externas de productos.
- Autocompletar nombre/precio desde internet.
- Impresión de etiquetas.
- Generación de códigos de barras.

## 3. Decisiones técnicas

La implementación debe respetar la arquitectura actual:

- Mantener formularios existentes:
  - `components/productos/product-form.tsx`.
  - `components/ventas/product-search.tsx`.
  - `components/ventas/sale-form.tsx`.
  - `components/inventario/stock-movement-form.tsx`.
- Mantener server actions actuales para productos, ventas e inventario.
- No mover lógica de negocio sensible al cliente.
- Usar scanner solo como entrada rápida de datos.
- Buscar productos en servidor filtrando por negocio activo.
- Validar siempre con Zod antes de guardar o consultar.

El scanner debe ser un componente cliente aislado, reutilizable y sin acoplarse a un formulario específico.

Principio:

- El scanner devuelve un `string` normalizado.
- Cada pantalla decide qué hacer con ese código.

Ejemplo conceptual:

```ts
type BarcodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
};
```

## 4. Librería elegida y justificación

Librería recomendada:

- `@zxing/browser`.

Justificación:

- Es moderna y mantenida dentro del ecosistema ZXing.
- Funciona en navegador usando `getUserMedia`.
- No requiere app nativa.
- Soporta formatos comunes como EAN-13, EAN-8, UPC-A, UPC-E, Code 128 y Code 39.
- Permite controlar el ciclo de lectura y detener la cámara.
- Se integra bien con React usando `useEffect`, `useRef` y cleanup.
- Evita implementar decodificación manual de video.

Alternativas consideradas:

- `quagga2`: útil para barcodes 1D, pero con API más antigua y más compleja de ajustar.
- APIs nativas como `BarcodeDetector`: prometedoras, pero con compatibilidad desigual en navegadores móviles.

Decisión:

- Usar `@zxing/browser` como primera implementación.
- Evaluar `BarcodeDetector` solo como optimización futura si se quiere reducir dependencia.

## 5. Diseño de base de datos (optimización de código de barras)

La tabla `products` ya contempla `barcode`. El diseño debe optimizar su uso sin agregar estructuras innecesarias.

### Formato recomendado

Guardar `barcode` como texto corto normalizado:

- Tipo lógico: `string`.
- Valor normalizado:
  - Sin espacios.
  - Sin guiones.
  - Sin caracteres invisibles.
  - Solo caracteres permitidos según formatos comerciales.
  - Longitud acotada.

No usar números:

- Algunos códigos pueden empezar con `0`.
- Convertir a número elimina ceros iniciales.
- Los códigos no se operan matemáticamente.

Longitud sugerida:

- Mínimo: 6 caracteres.
- Máximo: 32 caracteres.

Esto cubre:

- EAN-8: 8 dígitos.
- EAN-13: 13 dígitos.
- UPC-A: 12 dígitos.
- UPC-E: 6-8 dígitos.
- Code 128 / Code 39 con valores alfanuméricos controlados.

Formato recomendado:

```ts
const normalized = raw.trim().replace(/[\s-]/g, "").toUpperCase();
```

Validación conceptual:

```ts
barcode: z
  .string()
  .trim()
  .max(32)
  .regex(/^[A-Z0-9]{6,32}$/)
  .optional()
  .or(z.literal(""));
```

### Índice

Conviene indexar `barcode` para búsqueda rápida por negocio.

Índice recomendado:

```sql
create index if not exists idx_products_business_barcode
on public.products (business_id, barcode)
where barcode is not null and barcode <> '';
```

Motivo:

- Las búsquedas siempre deben filtrar por `business_id`.
- El índice compuesto acelera venta e inventario.
- El índice parcial evita indexar productos sin código.

### Duplicados

Recomendación:

- Evitar duplicados dentro del mismo negocio.
- Permitir el mismo código en negocios distintos.

Restricción sugerida:

```sql
create unique index if not exists uq_products_business_barcode
on public.products (business_id, barcode)
where barcode is not null and barcode <> '';
```

Consideración:

- Antes de aplicar índice único, revisar datos existentes.
- Si ya hay duplicados, crear una migración de limpieza o solo validar por server action en Fase 1.

Decisión conservadora:

- Fase 1: validar duplicados en server action.
- Fase posterior: agregar unique index si los datos ya están limpios.

## 6. Flujo de usuario (registro, venta, inventario)

### Registro de producto

Flujo:

1. Usuario entra a crear o editar producto.
2. Ve el campo `Código de barras`.
3. Presiona `Escanear código`.
4. Se abre scanner fullscreen o modal.
5. Autoriza cámara.
6. Sistema muestra `Escaneando...`.
7. Al detectar código:
   - Normaliza valor.
   - Valida formato.
   - Cierra scanner.
   - Completa el campo `barcode`.
8. Al guardar producto:
   - Zod valida `barcode`.
   - Server action verifica duplicado en el negocio activo.
   - Guarda en `products.barcode`.

### Venta

Flujo:

1. Usuario entra a `/ventas/nueva`.
2. En buscador de productos ve botón `Escanear código`.
3. Escanea un producto.
4. El cliente envía el código a una acción de búsqueda.
5. Servidor busca producto activo por `business_id` y `barcode`.
6. Si existe:
   - Se agrega automáticamente al carrito.
   - Si ya estaba, incrementa cantidad según unidad.
7. Si no existe:
   - Mostrar mensaje: `No encontramos un producto activo con ese código`.
   - Ofrecer buscar manualmente por nombre/SKU.

### Inventario

Flujo:

1. Usuario entra a nuevo movimiento de stock.
2. En selector de producto ve botón `Escanear código`.
3. Escanea producto.
4. Servidor busca producto activo por negocio y código.
5. Si existe:
   - El formulario selecciona automáticamente el producto.
   - Opcionalmente enfoca campo cantidad.
6. Si no existe:
   - Mostrar mensaje claro.
   - Mantener selector manual disponible.

## 7. Componentes a crear

### `components/barcode/barcode-scanner.tsx`

Componente cliente responsable de cámara y lectura.

Responsabilidades:

- Pedir permisos de cámara.
- Mostrar preview de video.
- Ejecutar lectura con `@zxing/browser`.
- Emitir código detectado.
- Mostrar estado:
  - `Preparando cámara...`
  - `Escaneando...`
  - `Código detectado`
  - `No se pudo acceder a la cámara`
- Detener cámara al cerrar.
- Cleanup en `useEffect`.

Props sugeridas:

```ts
type BarcodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
};
```

### `components/barcode/barcode-scan-button.tsx`

Botón reutilizable.

Responsabilidades:

- Renderizar `Escanear código`.
- Abrir scanner.
- Entregar resultado normalizado al componente padre.

Props sugeridas:

```ts
type BarcodeScanButtonProps = {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
};
```

### `components/barcode/barcode-status.tsx`

Opcional para mostrar mensajes consistentes:

- Código detectado.
- Código inválido.
- Producto encontrado.
- Producto no encontrado.
- Cámara sin permisos.

### `lib/barcode/normalize.ts`

Helper puro.

Responsabilidades:

- Normalizar string.
- Validar formato básico.
- Evitar duplicar lógica entre cliente, Zod y server actions.

Ejemplo conceptual:

```ts
export function normalizeBarcode(value: string) {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}
```

## 8. Archivos a modificar

Dependencias:

- `package.json`.
- `package-lock.json`.

Validaciones:

- `lib/validations/product.ts`.
- Posible nuevo helper: `lib/barcode/normalize.ts`.

Productos:

- `components/productos/product-form.tsx`.
- `modules/core/products/actions.ts`.

Ventas:

- `components/ventas/product-search.tsx`.
- `components/ventas/sale-form.tsx`.
- `modules/core/sales/actions.ts` o nuevo action de búsqueda por barcode si corresponde.

Inventario:

- `components/inventario/stock-movement-form.tsx`.
- `modules/core/stock-movements/actions.ts` o nuevo action de búsqueda por barcode.

Base de datos:

- Nueva migración opcional:
  - índice `(business_id, barcode)`.
  - unique index parcial si se decide aplicarlo.

Tipos:

- `types/database.ts` si cambia la base o se regenera.

## 9. Integración con módulos existentes

### `product-form.tsx`

Integración:

- Agregar botón `Escanear código` junto al input `barcode`.
- Al detectar código:
  - `setValue("barcode", normalizedBarcode)`.
  - Mostrar feedback `Código detectado`.
- No guardar automáticamente.
- El usuario mantiene control del formulario.

### `product-search.tsx`

Integración:

- Agregar botón `Escanear código` cerca del campo de búsqueda.
- Al detectar código:
  - Buscar producto activo por barcode.
  - Si encuentra, ejecutar callback existente para agregar/seleccionar producto.
  - Si no encuentra, mostrar mensaje y dejar búsqueda manual.

### `sale-form.tsx`

Integración:

- No acoplar scanner directamente al carrito si ya existe `product-search`.
- Preferir que `product-search` resuelva el producto y use el callback existente de `sale-form`.
- Si el producto ya existe en carrito, mantener la regla actual de incremento de cantidad.

### `stock-movement-form.tsx`

Integración:

- Agregar botón `Escanear código` junto al selector de producto.
- Al detectar código:
  - Buscar producto por negocio/barcode.
  - Setear producto seleccionado.
  - Enfocar cantidad.

### Server actions

Crear helper o action reutilizable:

```ts
findActiveProductByBarcode(barcode: string)
```

Debe:

- Requerir usuario.
- Resolver negocio activo.
- Normalizar barcode.
- Validar formato.
- Consultar `products`.
- Filtrar:
  - `business_id`.
  - `barcode`.
  - `active = true`.
- Devolver producto mínimo necesario para venta/inventario.

## 10. Fase 1 (scanner básico)

Objetivo:

Crear scanner reusable sin integrarlo todavía en todos los flujos.

Tareas:

- Instalar `@zxing/browser`.
- Crear `components/barcode/barcode-scanner.tsx`.
- Crear `components/barcode/barcode-scan-button.tsx`.
- Crear `lib/barcode/normalize.ts`.
- Crear validación base de barcode.
- Probar apertura/cierre de cámara en mobile.
- Manejar:
  - permiso denegado.
  - cámara no disponible.
  - scanner cerrado.
  - cleanup de stream.

Resultado esperado:

- Un botón puede abrir cámara y devolver un string normalizado.

## 11. Fase 2 (integración con productos)

Objetivo:

Permitir cargar y guardar códigos desde producto.

Tareas:

- Modificar `product-form.tsx`.
- Agregar botón `Escanear código` junto al input de barcode.
- Integrar normalización con el formulario.
- Modificar `lib/validations/product.ts`.
- Verificar duplicados en `modules/core/products/actions.ts`.
- Mostrar error si otro producto del mismo negocio ya usa ese código.
- Agregar índice `(business_id, barcode)` si corresponde.

Resultado esperado:

- Usuario puede escanear un código y guardarlo en el producto.
- El código queda normalizado y validado.

## 12. Fase 3 (integración con ventas e inventario)

Objetivo:

Usar barcode como acceso rápido a productos activos.

Tareas ventas:

- Modificar `product-search.tsx`.
- Crear action `findActiveProductByBarcode`.
- Al detectar código:
  - buscar producto.
  - agregar al carrito.
  - mostrar confirmación.

Tareas inventario:

- Modificar `stock-movement-form.tsx`.
- Reutilizar action de búsqueda.
- Al detectar código:
  - seleccionar producto.
  - enfocar cantidad.

Resultado esperado:

- Venta e inventario pueden operar productos por escaneo desde celular.

## 13. Criterios de terminado

La implementación se considera terminada si:

- El scanner abre cámara en navegador móvil compatible.
- Se puede cerrar el scanner y la cámara se apaga.
- El scanner devuelve un código normalizado.
- El formulario de producto completa `barcode`.
- El producto guarda `barcode` validado.
- No se permiten duplicados dentro del mismo negocio, al menos por server action.
- En ventas, escanear producto activo lo agrega al carrito.
- En inventario, escanear producto activo lo selecciona.
- Los errores son claros:
  - permiso denegado.
  - cámara no disponible.
  - código inválido.
  - producto no encontrado.
- No se rompe RLS.
- Todas las búsquedas filtran por negocio activo.
- `npm run build` pasa.

## 14. Riesgos

### Compatibilidad de navegador

No todos los navegadores móviles manejan cámara igual.

Mitigación:

- Probar Chrome Android.
- Probar Safari iOS.
- Mostrar fallback manual si falla.

### Permisos de cámara

El usuario puede negar permisos.

Mitigación:

- Mensaje claro.
- Permitir ingreso manual del código.

### Lecturas repetidas

El scanner puede detectar el mismo código varias veces.

Mitigación:

- Bloquear detección después del primer resultado.
- Cerrar scanner automáticamente.
- Usar flag `hasDetectedRef`.

### Performance

La cámara consume batería y CPU.

Mitigación:

- Abrir solo a demanda.
- Detener tracks al cerrar.
- Evitar renders por frame.
- Mantener estado mínimo.

### Duplicados históricos

Puede haber productos con mismo barcode si ya se cargaron manualmente.

Mitigación:

- Validar duplicado antes de guardar.
- Crear unique index solo después de revisar datos.

### Seguridad

Buscar por barcode podría filtrar productos de otro negocio si se implementa mal.

Mitigación:

- Nunca consultar solo por barcode.
- Siempre usar `business_id`.
- Mantener RLS como segunda capa.

## 15. Qué NO hacer aún

No implementar todavía:

- App nativa.
- Escáner Bluetooth especializado.
- Integración con proveedores externos de productos.
- Autocompletar nombre/precio por internet.
- Generación o impresión de etiquetas.
- Lectura QR para flujos internos.
- Modo offline.
- Historial de escaneos.
- Ajustes masivos por escaneo continuo.

La primera versión debe resolver una necesidad concreta: usar la cámara del celular para capturar códigos de barras y acelerar carga, venta e inventario sin cambiar la arquitectura principal de MultiStock.
