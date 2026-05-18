Quiero que crees un archivo llamado `arquitectura-reportes-pro.md`.

El objetivo es rediseñar completamente el sistema de exportación de reportes en MultiStock, tomando como referencia un diseño tipo ERP (tabla estructurada con encabezado superior), basado en una plantilla visual estandarizada.

IMPORTANTE:
- NO incluir botones como “registrar” o “instructivo”
- El encabezado debe decir "MultiStock"
- Mantener compatibilidad con los datos actuales (CSV)
- Enfocar en claridad visual y uso en Excel
- Crear un sistema reutilizable para todos los reportes

---

# 🎯 OBJETIVO GENERAL

Transformar los reportes actuales (CSV simples) en reportes estructurados, profesionales y consistentes visualmente, similares a un ERP.

---

# 🧱 FASE 1 — Definición de plantilla base

Crear una plantilla reutilizable para todos los reportes con:

Encabezado:

- Título principal: "MultiStock"
- Subtítulo dinámico (nombre del reporte)
- Espaciado claro
- Sin botones

---

# 🧠 FASE 2 — Estructura de tabla estándar

Definir una estructura común:

- Encabezados en mayúscula
- Columnas alineadas
- Separación clara entre filas
- Orden lógico de datos

---

# 📦 FASE 3 — Mapeo por tipo de reporte

Definir cómo se muestran los datos:

## Productos

Campos:

- Código → sku
- Descripción → nombre
- Unidad → unidad
- Precio → precio_venta
- Estado → activo

---

## Inventario

Campos:

- Producto → nombre
- Stock actual → stock_actual
- Stock mínimo → stock_minimo
- Unidad → unidad

Agregar columna:

- Estado:
  - "Stock bajo"
  - "Stock crítico"
  - "OK"

---

## Movimientos

Campos:

- Fecha → fecha
- Tipo → tipo
- Cantidad → cantidad
- Motivo → motivo

---

## Ventas

Campos:

- Fecha → fecha
- Total → total
- Método de pago → metodo_pago

---

## Alertas

Campos:

- Fecha → fecha
- Tipo → tipo
- Mensaje → mensaje
- Estado → resuelta

---

# 🎨 FASE 4 — Mejora visual

Aplicar:

- encabezado con fondo destacado
- filas alternadas (mejor lectura)
- alineación correcta (números a la derecha)
- fechas legibles
- moneda con formato $

---

# 🧩 FASE 5 — Lógica de estado (tipo ERP)

Agregar columnas calculadas:

Inventario:

- si stock_actual < stock_minimo → "Stock bajo"
- si stock_actual muy bajo → "Crítico"
- si no → "OK"

Alertas:

- resuelta true → "Resuelta"
- false → "Pendiente"

---

# 📊 FASE 6 — Totales y resumen

Agregar al final:

- total de registros
- totales (ventas)
- resumen simple

---

# 🔄 FASE 7 — Sistema reutilizable

Crear lógica que permita:

- reutilizar la misma plantilla
- cambiar solo columnas y datos
- mantener consistencia en todos los reportes

---

# 📱 FASE 8 — Compatibilidad

Asegurar:

- exportación a Excel funcional
- lectura clara en PDF
- compatibilidad con CSV mejorado

---

# 🧪 FASE 9 — Testing

Verificar:

- productos exportan correctamente
- inventario muestra estados
- ventas muestran totales
- alertas muestran estado claro

---

# 🚀 RESULTADO FINAL

- todos los reportes con diseño uniforme
- apariencia profesional tipo ERP
- fácil lectura para el usuario
- listos para uso real en negocio

---

# ✅ CHECKLIST FINAL

- [ ] encabezado dice MultiStock
- [ ] sin botones innecesarios
- [ ] tablas claras y ordenadas
- [ ] estados calculados funcionando
- [ ] totales visibles
- [ ] diseño consistente en todos los reportes