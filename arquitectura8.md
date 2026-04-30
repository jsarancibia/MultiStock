# Arquitectura 8 - Flujos simples y operacion sin friccion

Este documento define como deben funcionar los flujos principales de MultiStock para que cualquier comerciante pueda usarlo sin capacitacion tecnica.

Regla principal:

```txt
Todo flujo frecuente debe poder completarse en pocos pasos, con lenguaje claro y sin campos innecesarios.
```

---

# Fase 21 - Crear productos en pasos simples

## Objetivo

Simplificar la carga de productos para que sea rapida, guiada y adaptada al rubro.

## Flujo ideal

```txt
1. Datos basicos
   - nombre
   - categoria
   - codigo/SKU/barcode opcional

2. Precio y stock
   - costo
   - precio de venta
   - stock inicial
   - stock minimo

3. Datos del rubro
   - solo campos utiles segun verduleria, almacen o ferreteria

4. Confirmar
   - resumen visible
   - guardar producto
```

## Modo rapido

Para comercios chicos debe existir un modo de carga rapida:

```txt
Nombre + precio de venta + stock inicial
```

El resto queda como opcional o avanzado.

## Reglas UX

- No mostrar todos los campos al mismo tiempo si abruman.
- Separar campos obligatorios de opcionales.
- Usar ayudas cortas debajo de campos sensibles.
- Mostrar errores al lado del campo.
- Si el barcode ya existe, explicar cual producto lo usa.
- Permitir guardar y crear otro producto.

## Criterios de aceptacion

- Un producto simple se puede crear en menos de 1 minuto.
- Un usuario nuevo entiende que campos son obligatorios.
- El formulario cambia segun rubro sin parecer una app distinta.
- Los errores son claros y accionables.

---

# Fase 22 - Venta rapida y punto de venta sencillo

## Objetivo

Convertir la venta en el flujo mas rapido de la app.

## Flujo ideal

```txt
1. Buscar o escanear producto
2. Agregar automaticamente si hay coincidencia exacta
3. Ajustar cantidad si hace falta
4. Elegir metodo de pago
5. Confirmar venta
```

## Reglas UX

- El buscador debe estar enfocado al abrir la pantalla.
- El scanner USB debe funcionar como teclado.
- Coincidencia exacta por barcode debe agregarse rapido.
- El carrito debe mostrar total siempre visible.
- El boton confirmar debe estar claro y separado de acciones secundarias.
- Si falta stock, explicar que producto falla y cuanto hay disponible.

## Vista objetivo

```txt
┌─────────────────────────────┬────────────────────┐
│ Buscar producto             │ Resumen de venta    │
│ [input enfocado]            │ Total               │
│                             │ Metodo de pago      │
│ Resultados                  │ Confirmar venta     │
│                             │                    │
│ Items agregados             │                    │
└─────────────────────────────┴────────────────────┘
```

## Criterios de aceptacion

- Una venta simple se registra en menos de 30 segundos.
- El total se entiende sin hacer calculos.
- El usuario puede operar con mouse, teclado o scanner.
- Los errores no borran el carrito.

---

# Fase 23 - Inventario y movimientos sin confusion

## Objetivo

Que el usuario entienda rapidamente como entra, sale o se ajusta stock.

## Tipos de movimiento visibles

- compra / ingreso
- venta
- ajuste
- merma
- devolucion
- stock inicial

## Flujo ideal para movimiento manual

```txt
1. Elegir producto
2. Elegir tipo de movimiento
3. Ingresar cantidad
4. Agregar motivo opcional
5. Confirmar
```

## Reglas UX

- Mostrar stock actual antes de confirmar.
- Mostrar como quedara el stock despues del movimiento.
- No permitir stock negativo sin explicacion.
- Para merma, usar lenguaje simple: "producto perdido, vencido o dañado".
- Para ajuste, explicar que puede sumar o restar.

## Criterios de aceptacion

- El usuario sabe si esta sumando o restando stock.
- El sistema muestra el resultado antes de guardar.
- Las alertas de bajo stock se entienden como proximo paso.

---

# Fase 24 - Onboarding y acciones guiadas

## Objetivo

Que un negocio nuevo pueda empezar sin leer documentacion.

## Primer recorrido sugerido

```txt
1. Crear negocio
2. Elegir rubro
3. Crear 3 productos
4. Registrar stock inicial
5. Hacer primera venta
6. Revisar dashboard
```

## Checklist inicial dentro de la app

- Crear primer producto.
- Crear primera categoria.
- Registrar stock inicial.
- Hacer primera venta.
- Revisar alertas.

## Criterios de aceptacion

- El usuario siempre sabe cual es el proximo paso.
- Las pantallas vacias invitan a una accion concreta.
- No hay modulos bloqueantes para empezar a vender.
