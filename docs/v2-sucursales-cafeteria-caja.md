# Arquitectura v2 - sucursales, cafeteria y caja simple

## Objetivo

Definir el diseno antes de tocar la base productiva para evitar romper el MVP y v1.

## Sucursales (diseno previo)

### Modelo propuesto

```txt
branches
- id
- business_id
- name
- address
- active
- created_at
```

### Decision clave de inventario

`products.current_stock` se mantiene en v1.  
Para activar sucursales se migra a:

```txt
branch_stock
- id
- branch_id
- product_id
- current_stock
- min_stock
- updated_at
```

### Impacto esperado

- `sales` debe agregar `branch_id`.
- `stock_movements` debe agregar `branch_id`.
- dashboards y reportes deben poder filtrar por sucursal.
- se mantiene compatibilidad inicial con una sucursal por defecto.

## Caja simple (no fiscal)

### Alcance

- apertura de caja
- cierre de caja
- total esperado
- total declarado
- diferencia

### Fuera de alcance

- facturacion fiscal
- controladoras fiscales
- arqueo avanzado por denominacion

## Rubro cafeteria (como extension)

### Campos base de metadata

- `prepared_product` (boolean)
- `simple_recipe` (text)
- `main_input` (text)
- `prep_unit` (text)
- `estimated_margin` (numeric)

### Restriccion

No se habilita hasta que `cafeteria_v2` se active por feature flag.
