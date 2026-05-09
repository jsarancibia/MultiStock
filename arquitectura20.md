# INVENTARIO — MEJORAS UX + FUNCIONALIDAD

Objetivo:
Mejorar flujo de productos, navegación, alertas e inventario para hacer el sistema más intuitivo, profesional y útil para negocios pequeños.

Prioridad:
Alta.

---

## 1. FORMATO DE HORA

Problema:
Actualmente el formato de hora no es consistente.

Cambios requeridos:
- Usar formato:
HH:mm:ss

Ejemplo:
14:32:08

Aplicar en:
- Libro de novedades
- Historial
- Alertas
- Logs
- Movimientos de stock
- Fechas visibles del sistema

Formato esperado:
hora:minuto:segundo

---

## 2. ALERTA AL CREAR CUENTA (MEJOR UX)

Problema:
Cuando se crea una cuenta no queda claro qué hacer si no inicia sesión automáticamente.

Nuevo comportamiento:
Al crear cuenta exitosamente:

Mostrar alerta flotante pequeña (toast notification).

Texto:

"Cuenta creada correctamente. Si no ingresas automáticamente, confirma tu email y luego inicia sesión."

Requisitos UX:
- pequeña
- moderna
- flotante
- esquina superior derecha
- auto cerrar en 4–5 segundos
- diseño limpio y profesional
- color éxito (verde suave)

No usar modal grande.

---

## 3. CREAR CATEGORÍA AL CREAR PRODUCTO

Problema:
Si la categoría no existe, el usuario queda bloqueado.

Nuevo comportamiento:
En selector de categoría:

Agregar opción:
"+ Crear nueva categoría"

Flujo:
1. Usuario abre categorías.
2. Si no existe:
   "+ Crear categoría"

Abrir modal pequeño:
Campos:
- nombre categoría

Botones:
- Cancelar
- Crear

Al crear:
- guardar automáticamente
- refrescar selector
- seleccionar nueva categoría automáticamente

Objetivo:
No obligar al usuario a salir del flujo de producto.

---

## 4. NAVEGACIÓN ENTRE PASOS (WIZARD)

Problema:
El usuario puede abrir algo por error y no puede volver fácilmente.

Cambios:
Agregar navegación entre pestañas/pasos.

Debe existir:

Botón:
← Volver

Botón:
Cancelar

Comportamiento:
- volver al paso anterior sin perder datos
- cancelar confirma antes de salir

Mensaje:

"¿Deseas cancelar? Se perderán los cambios no guardados."

Aplicar especialmente:
- Crear producto
- Formularios multi-step

UX:
El usuario nunca debe sentirse atrapado.

---

## 5. IDENTIFICADOR OBLIGATORIO PRODUCTO

Problema:
Producto puede quedar sin identificador.

Nueva regla:

Debe existir AL MENOS uno:

- SKU
o
- Código de barras

Lógica:

Caso 1:
Si no hay código de barras:
→ SKU obligatorio

Caso 2:
Si no hay SKU:
→ código de barras obligatorio

Caso 3:
Si ambos vacíos:
→ error de validación

Mensaje:

"El producto debe tener al menos un identificador (SKU o código de barras)."

---

## 6. REESTRUCTURAR CREAR PRODUCTO (MEJORA UX)

Problema:
La sección "Rubro" aporta poco valor.

Nueva estructura:

### 1) Datos básicos
Mantener igual.
✔ correcto

Contenido:
- nombre
- descripción
- categoría
- proveedor
- SKU / código barras

---

### 2) Precio y stock
Mantener igual.
✔ correcto

Contenido:
- precio compra
- precio venta
- stock actual
- stock mínimo

---

### 3) Venta rápida
Nueva sección simplificada.

Objetivo:
Facilitar ventas rápidas.

Campos:

- Alta rotación (switch)
Texto ayuda:
"Producto vendido frecuentemente"

- Acceso rápido en ventas (switch)
Texto ayuda:
"Mostrar producto rápidamente en pantalla de ventas"

Eliminar campos innecesarios.

---

### 4) Opciones avanzadas
Nueva sección colapsable.

Por defecto:
cerrada

Contenido:

#### Margen sugerido
Descripción:
"Calcula automáticamente una sugerencia de precio basada en utilidad."

#### Categoría comercial
Descripción:
"Sirve para organizar productos según tipo de negocio o reportes."

Ejemplos:
- Abarrotes
- Bebidas
- Limpieza
- Mascotas

Objetivo:
Que aporte valor real y no se vea relleno.

---

### 5) Confirmar
Mantener pero mejorar UX.

Mostrar resumen visual:

Datos básicos
Precio y stock
Venta rápida
Opciones avanzadas

Antes de crear:

Checklist visual:
✔ nombre
✔ identificador
✔ precio
✔ stock

Botones:
← Volver
Crear producto

Objetivo:
Evitar errores antes de guardar.

---

## 7. MODIFICAR PRODUCTOS

Problema:
No existe edición rápida.

Agregar botón:
"Modificar producto"

Ubicación:
Listado de productos

Abrir modal o drawer.

Permitir editar:

- proveedor
- margen
- precio
- estado

Estado:
- activo
- pausado
- descontinuado

UX:
Rápido y simple.

No abrir formulario enorme.

---

## 8. INDICADOR VISUAL DE ALERTAS

Problema:
No se sabe cuando existen alertas.

Nuevo comportamiento:

Si hay alertas activas:

Mostrar indicador visual lateral.

Ejemplo:
- punto rojo
o
- badge con número

Ubicación:
Sidebar menú Alertas.

Ejemplo:
Alertas 🔴

o

Alertas (3)

Debe desaparecer cuando:
No existan alertas pendientes.

---

## 9. AGREGAR STOCK DESDE INVENTARIO

Problema:
No existe forma rápida de aumentar stock.

Agregar botón:
"+ Agregar stock"

Ubicación:
Listado inventario/producto.

Flujo:

Click:
Agregar stock

Modal simple:

Campos:
- cantidad
- motivo (opcional)

Ejemplo:
- compra proveedor
- ajuste manual
- devolución

Mostrar:
stock actual

Acción:
sumar al stock existente

Guardar movimiento en historial.

Ejemplo:
"Se agregaron +15 unidades"

Objetivo:
No editar manualmente stock actual.
Debe existir control real.