# MultiStock — especificación ejecutada (`arquitectura-reportes`)

Resumen técnico de lo implementado a partir de `arquitectura-reportes.md`.

## Plantilla ERP (Excel `.xlsx`)

- **Portada** (primera pestaña): logo MultiStock (JPG desde `public/logo-light.jpg`, con alternativas configuradas), texto de plantilla unificada para todos los rubros, **ID del negocio**, nombre, rubro, fecha/exportador.
- Encabezado **MultiStock** y subtítulo por hoja (sin botones tipo registro/instructivo); mismo layout de columnas para **todo negocio**; solo cambian los valores y los metadatos de portada/contexto.
- Fila tipo **Lista · …** antes de la tabla.
- Cabeceras en mayúsculas, primera fila congelada bajo banner.
- Banda de lectura por filas alternadas.
- Inventario con columnas calculadas **ESTADO** y **SOLICITAR**, con formato por semáforo (similar ERP).
- Footer con **TOTAL REGISTROS**; Ventas incluye también **TOTAL $** sumado en el período exportado.

Hojas: `Productos`, `Inventario`, `Movimientos`, `Ventas`, `Alertas`.

## CSV mejorado

Mismos datos que el Excel donde aplica (inventario con `estado_stock`, `solicitar`, categoría y almacén; alertas con `estado` texto; métodos/tipos más legibles), manteniendo descarga abierta desde la UI.

## Código principal

| Pieza | Ruta |
|-------|------|
| Consulta única datos | `lib/reports/export-queries.ts` |
| Estados inventario | `lib/reports/inventory-stock-status.ts` |
| Generación Excel estilizada | `lib/reports/build-multistock-excel.ts` |
| CSV + servidor | `modules/core/reports/actions.ts` |
| Descarga HTTP | `app/api/exportaciones/excel/route.ts` |
| Pantalla usuario | `app/(app)/exportaciones/page.tsx` |

## Checklist

- Encabezado dice MultiStock ✓  
- Sin botones innecesarios ✓  
- Tablas claras ✓  
- Estados calculados (inventario y alertas) ✓  
- Totales ✓  
- Diseño único reusable por hoja ✓  
