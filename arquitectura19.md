El objetivo es implementar correctamente el **soporte de ventas por peso (kg con decimales)** en MultiStock, enfocado especialmente en verdulerías, pero sin romper compatibilidad con almacenes y ferreterías.

IMPORTANTE:
- NO incluir ejemplos de código
- NO romper lo ya construido (ventas, productos, scanner, POS)
- Reutilizar lógica existente
- Mantener compatibilidad con productos por unidad
- UX simple, rápida y clara para negocios reales

---

# 🎯 OBJETIVO GENERAL

Permitir que el sistema soporte ventas reales por peso:

👉 El usuario puede ingresar cantidades como 1.25 kg, 0.5 kg, 2.30 kg  
👉 El sistema calcula automáticamente el total  
👉 El stock se descuenta correctamente usando decimales  

---

# 🧱 FASE 1 — Validación del modelo de datos

Revisar el modelo actual de productos y asegurar:

- Existe un campo que define el tipo de venta:
  - unit (por unidad)
  - weight (por peso)

- El campo de stock:
  - debe permitir valores decimales
  - debe representar correctamente kilos en productos tipo weight

- El precio:
  - en productos weight debe representar precio por kg

Validar que la base de datos soporte decimales correctamente.

---

# 🧠 FASE 2 — Normalización de lógica de ventas

Revisar la lógica actual del carrito y ventas:

- Asegurar que:
  - se puede trabajar con cantidades decimales
  - no existan validaciones que fuercen enteros

- Definir comportamiento:

  Productos tipo weight:
  - permiten decimales
  - el subtotal se calcula en base a cantidad * precio

  Productos tipo unit:
  - solo permiten enteros
  - mantienen comportamiento actual

---

# 🧩 FASE 3 — Adaptación del input de cantidad

Modificar el input de cantidad en el flujo de ventas:

- Detectar tipo de producto
- Cambiar comportamiento del input:

  Para weight:
  - permitir decimales
  - permitir valores menores a 1
  - evitar redondeos automáticos

  Para unit:
  - mantener solo enteros

- Asegurar que el usuario entienda que está ingresando kilos

---

# 🖥️ FASE 4 — Actualización dinámica del subtotal

En el flujo de venta:

- El subtotal debe actualizarse automáticamente al cambiar la cantidad
- El cálculo debe ser preciso y sin redondeos agresivos
- Debe reflejar correctamente precios por kg

---

# 📦 FASE 5 — Manejo de stock con decimales

Actualizar la lógica de confirmación de venta:

- El stock debe descontarse usando valores decimales
- Validar:

  - que no se pueda vender más stock del disponible
  - que los decimales se mantengan consistentes

- Evitar errores acumulativos por redondeo

---

# 🎨 FASE 6 — Representación en UI

Actualizar cómo se muestran los datos:

- Cantidad:
  - mostrar con máximo 2 decimales
  - incluir unidad (kg)

- Precio:
  - indicar claramente que es precio por kg

- Subtotal:
  - mostrar valor final claro

- Evitar confusión entre unidad y peso

---

# 🧠 FASE 7 — Integración con POS dinámico (arquitectura17 / 18)

Asegurar que:

- Verdulería:
  - usa siempre lógica de peso por defecto

- Almacén:
  - mantiene lógica por unidad

- Ferretería:
  - permite ambos comportamientos

La UI debe adaptarse automáticamente según tipo de producto.

---

# 🔄 FASE 8 — Compatibilidad con productos existentes

Revisar productos ya creados:

- Productos sin tipo definido:
  - asignar valor por defecto (unit)

- Productos tipo weight:
  - validar stock actual
  - validar precios

Evitar romper datos antiguos.

---

# ⚠️ FASE 9 — Validaciones críticas

Implementar validaciones:

- no permitir cantidad negativa
- no permitir venta mayor al stock
- no permitir valores vacíos
- validar formato decimal correcto

---

# 🧪 FASE 10 — Testing funcional

Probar escenarios reales:

- vender 1.5 kg
- vender 0.25 kg
- vender múltiples productos con peso
- mezclar productos unitarios y por peso
- verificar stock antes y después

---

# 📱 FASE 11 — UX optimizada para negocios reales

Asegurar:

- inputs fáciles de usar en móvil
- rapidez al ingresar cantidades
- claridad en unidades (kg vs unidad)

---

# 🔒 FASE 12 — Consistencia y precisión

Asegurar:

- consistencia en cálculos
- evitar errores por redondeo
- mantener precisión en DB y UI

---

# 📦 RESULTADO FINAL

El sistema debe permitir:

✔ ventas por peso reales  
✔ cálculos automáticos correctos  
✔ stock actualizado correctamente  
✔ coexistencia con productos por unidad  
✔ experiencia clara para el usuario  

---

# ✅ CHECKLIST FINAL

- [ ] productos weight permiten decimales
- [ ] subtotal se calcula correctamente
- [ ] stock se descuenta correctamente
- [ ] UI muestra kg claramente
- [ ] no se rompe lógica existente
- [ ] funciona en todos los tipos de negocio