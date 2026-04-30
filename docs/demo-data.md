# Datos Demo MultiStock

Esta guía define datos demo realistas para mostrar el flujo completo.

## Objetivo

- Poblar productos, proveedores y movimientos para una demo convincente.
- Cubrir los 3 rubros: verdulería, almacén y ferretería.
- Permitir pruebas de dashboard, alertas, ventas y auditoría.

## Recomendación general

1. Crear un negocio por rubro.
2. Crear 2-3 categorías por negocio.
3. Crear 2-3 proveedores por negocio.
4. Cargar 5-8 productos por negocio.
5. Registrar movimientos (compra/ajuste/merma).
6. Registrar 3-5 ventas.
7. Confirmar alertas y auditoría.

## Verdulería (ejemplo)

Productos sugeridos:

- Banana (kg, perecible, venta por peso).
- Manzana (kg, perecible, venta por peso).
- Tomate (kg, perecible, venta por peso).
- Papa (kg).
- Frutilla (unidad o bandeja, perecible).

Escenario demo:

- Stock inicial alto en Banana y Papa.
- Merma en Frutilla.
- Al menos un producto bajo stock para alertas.

## Almacén (ejemplo)

Productos sugeridos:

- Leche 1L
- Arroz 1kg
- Aceite 900ml
- Galletitas
- Gaseosa 2.25L

Campos útiles:

- `fast_rotation` para Leche/Gaseosa.
- `suggested_margin` en varios productos.
- SKU o código de barras simulado.

## Ferretería (ejemplo)

Productos sugeridos:

- Tornillo 5cm (acero)
- Cinta métrica 5m
- Llave francesa 12"
- Pintura blanca 4L
- Taladro 500W

Campos técnicos:

- Marca, modelo, medida, material.

Escenario demo:

- Uno o dos productos técnicos bajo mínimo.
- Un producto sin movimiento en 30 días.

## Validación mínima de demo

- `/dashboard` muestra métricas y actividad reciente.
- `/productos` muestra filtros y datos por rubro.
- `/inventario` y `/inventario/movimientos` muestran historial.
- `/ventas` y `/ventas/[id]` con montos y método de pago.
- `/alertas` con una alerta pendiente y otra resuelta.
- `/auditoria` con eventos de alta, edición, venta y movimiento.
