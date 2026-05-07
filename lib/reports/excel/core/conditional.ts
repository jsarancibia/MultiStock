/**
 * Formato condicional programático para tablas Excel.
 *
 * ExcelJS no genera las fórmulas de formato condicional nativas de Excel,
 * pero podemos aplicar estilos de celda en tiempo de generación con la misma lógica.
 *
 * Uso:
 *   const rules: ConditionalRule[] = [
 *     {
 *       columnKey: "stock",
 *       conditions: [
 *         { operator: "lte", threshold: 0,  styleKey: "statusAlert" },
 *         { operator: "lte", threshold: 5,  styleKey: "statusWarn"  },
 *         { operator: "gt",  threshold: 5,  styleKey: "statusOk"    },
 *       ],
 *     },
 *   ];
 */
import type ExcelJS from "exceljs";
import { applyStyle, type CellStyle, type StyleSet } from "./styles";

// ── Tipos públicos ─────────────────────────────────────────────────────────

export type ConditionalOperator =
  | "lt"        // menor que
  | "lte"       // menor o igual que
  | "gt"        // mayor que
  | "gte"       // mayor o igual que
  | "eq"        // igual a
  | "neq"       // diferente de
  | "contains"  // contiene (string)
  | "startsWith";// comienza con (string)

export type ConditionalCondition = {
  operator: ConditionalOperator;
  threshold: number | string;
  /** Clave del StyleSet (ej. "statusAlert") o un CellStyle inline */
  styleKey: keyof StyleSet | CellStyle;
};

export type ConditionalRule = {
  /** Columna a evaluar (key de ReportColumn) */
  columnKey: string;
  /**
   * Columna a la que aplicar el estilo.
   * Si no se especifica, se aplica a la misma columna que se evalúa.
   */
  targetColumnKey?: string;
  /** Condiciones evaluadas en orden — la primera que coincide gana */
  conditions: ConditionalCondition[];
};

// ── Evaluador ─────────────────────────────────────────────────────────────

/**
 * Evalúa si un valor cumple una condición.
 */
export function testCondition(
  value: string | number | Date | null | undefined,
  operator: ConditionalOperator,
  threshold: number | string
): boolean {
  if (value == null) return false;

  const numVal = typeof value === "number" ? value : parseFloat(String(value));
  const strVal = String(value).toLowerCase();
  const strThreshold = String(threshold).toLowerCase();
  const numThreshold = typeof threshold === "number" ? threshold : parseFloat(String(threshold));

  switch (operator) {
    case "lt":  return !isNaN(numVal) && numVal < numThreshold;
    case "lte": return !isNaN(numVal) && numVal <= numThreshold;
    case "gt":  return !isNaN(numVal) && numVal > numThreshold;
    case "gte": return !isNaN(numVal) && numVal >= numThreshold;
    case "eq":  return strVal === strThreshold || numVal === numThreshold;
    case "neq": return strVal !== strThreshold && numVal !== numThreshold;
    case "contains":   return strVal.includes(strThreshold);
    case "startsWith": return strVal.startsWith(strThreshold);
    default:    return false;
  }
}

/**
 * Resuelve el estilo de una condición: si es un string (keyof StyleSet),
 * lo busca en el StyleSet; si es un CellStyle inline, lo retorna directo.
 */
export function resolveConditionStyle(
  condition: ConditionalCondition,
  styles: StyleSet
): CellStyle | null {
  if (!condition.styleKey) return null;

  if (typeof condition.styleKey === "string") {
    const s = styles[condition.styleKey as keyof StyleSet];
    // Solo retornar si es un CellStyle (objeto con font/fill/etc.), no el stripe overlay
    if (s && typeof s === "object" && ("font" in s || "fill" in s || "alignment" in s)) {
      return s as CellStyle;
    }
    return null;
  }

  return condition.styleKey as CellStyle;
}

/**
 * Aplica las reglas de formato condicional a una celda específica.
 * Evalúa las condiciones en orden — la primera que cumple se aplica.
 *
 * @param cell      - Celda de destino donde se aplica el estilo
 * @param evalValue - Valor a evaluar contra las condiciones
 * @param rule      - Regla de formato condicional
 * @param styles    - StyleSet del tema activo
 * @returns         - true si se aplicó algún estilo
 */
export function applyConditionalToCell(
  cell: ExcelJS.Cell,
  evalValue: string | number | Date | null | undefined,
  rule: ConditionalRule,
  styles: StyleSet
): boolean {
  for (const condition of rule.conditions) {
    if (testCondition(evalValue, condition.operator, condition.threshold)) {
      const style = resolveConditionStyle(condition, styles);
      if (style) {
        applyStyle(cell, style);
        return true;
      }
    }
  }
  return false;
}
