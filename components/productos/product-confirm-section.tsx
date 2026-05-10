"use client";

import type { BusinessType } from "@/config/business-types";
import { formSectionClass } from "@/components/ui/form-field-styles";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingCart,
} from "lucide-react";

type ProductConfirmSectionProps = {
  snapshot: FormData;
  businessType: BusinessType;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
};

function getVal(snapshot: FormData, key: string): string {
  return (snapshot.get(key) as string) ?? "";
}

export function ProductConfirmSection({
  snapshot,
  businessType,
  categories,
  suppliers,
}: ProductConfirmSectionProps) {
  const name = getVal(snapshot, "name");
  const categoryId = getVal(snapshot, "categoryId");
  const supplierId = getVal(snapshot, "supplierId");
  const sku = getVal(snapshot, "sku");
  const barcode = getVal(snapshot, "barcode");
  const unitType = getVal(snapshot, "unitType");
  const costPrice = getVal(snapshot, "costPrice");
  const salePrice = getVal(snapshot, "salePrice");
  const currentStock = getVal(snapshot, "currentStock");
  const minStock = getVal(snapshot, "minStock");
  const fastRotation = getVal(snapshot, "fast_rotation") === "on";
  const pinned = getVal(snapshot, "pinned") === "on";

  const categoryName =
    categories.find((c) => c.id === categoryId)?.name ?? null;
  const supplierName =
    suppliers.find((s) => s.id === supplierId)?.name ?? null;

  const cost = Number(costPrice);
  const sale = Number(salePrice);
  const stock = Number(currentStock);
  const hasIdentificador = Boolean(sku || barcode);
  const needsIdentificador =
    businessType === "almacen" || businessType === "ferreteria";
  const showIdentificadorWarning = needsIdentificador && !hasIdentificador;
  const showPrecioWarning = sale <= 0;
  const showStockWarning = stock <= 0;
  const showNameWarning = name.trim().length < 2;

  const allValid =
    !showNameWarning &&
    !showPrecioWarning &&
    !showStockWarning &&
    !showIdentificadorWarning;

  return (
    <div className={formSectionClass}>
      <h2 className="mb-1 text-sm font-semibold text-foreground">
        ✅ Revisión final
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Verifica los datos antes de crear el producto.
      </p>

      <div className="space-y-3">
        {/* ---- Producto ---- */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Producto
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre</dt>
              <dd className="font-medium text-foreground">{name || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Categoría</dt>
              <dd className="font-medium text-foreground">
                {categoryName ?? "Sin categoría"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Proveedor</dt>
              <dd className="font-medium text-foreground">
                {supplierName ?? "Sin proveedor"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Unidad</dt>
              <dd className="font-medium text-foreground uppercase">{unitType}</dd>
            </div>
            {sku ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium text-foreground">{sku}</dd>
              </div>
            ) : null}
            {barcode ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Código de barras</dt>
                <dd className="font-medium text-foreground">{barcode}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {/* ---- Precio y stock ---- */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Precio y stock
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Costo</dt>
              <dd className="font-medium text-foreground">
                {cost > 0 ? formatCurrency(costPrice) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Venta</dt>
              <dd className="font-medium text-foreground">
                {formatCurrency(salePrice)}
              </dd>
            </div>
            {cost > 0 && sale > 0 ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ganancia aprox</dt>
                  <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(String(sale - cost))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Margen aprox</dt>
                  <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {(((sale - cost) / cost) * 100).toFixed(0)}%
                  </dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Stock inicial</dt>
              <dd className="font-medium text-foreground">{currentStock}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Stock mínimo</dt>
              <dd className="font-medium text-foreground">{minStock}</dd>
            </div>
          </dl>
        </div>

        {/* ---- Venta rápida ---- */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Venta rápida
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Alta rotación</dt>
              <dd className="font-medium text-foreground">
                {fastRotation ? "Sí" : "No"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Acceso rápido en ventas</dt>
              <dd className="font-medium text-foreground">
                {pinned ? "Sí" : "No"}
              </dd>
            </div>
          </dl>
        </div>

        {/* ---- Checklist visual ---- */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Checklist
          </h3>
          <ul className="space-y-1 text-sm">
            <CheckItem
              ok={!showNameWarning}
              label="Nombre del producto"
              warn="Falta nombre del producto"
            />
            <CheckItem
              ok={!showPrecioWarning}
              label="Precio de venta"
              warn="⚠ Falta precio de venta"
            />
            <CheckItem
              ok={!showStockWarning}
              label="Stock inicial"
              warn="⚠ Debes agregar stock"
            />
            {needsIdentificador ? (
              <CheckItem
                ok={hasIdentificador}
                label="Identificador (SKU o código de barras)"
                warn="⚠ Falta SKU o código de barras"
              />
            ) : null}
            <CheckItem
              ok={true}
              label="Configuración revisada"
            />
          </ul>
        </div>

        {/* ---- Vista previa ---- */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Package className="size-3" aria-hidden />
            Vista previa — así se verá en ventas
          </h3>
          <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{name || "Sin nombre"}</p>
            <p className="text-lg font-bold text-foreground">
              {sale > 0 ? formatCurrency(salePrice) : "—"}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShoppingCart className="size-3" aria-hidden />
                Stock: {currentStock || "0"}
              </span>
              <span className="uppercase">{unitType}</span>
              {barcode ? <span>#{barcode}</span> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden submit buttons area handled by the parent form */}
      <input type="hidden" name="intent" value="" />
    </div>
  );
}

function CheckItem({
  ok,
  label,
  warn,
}: {
  ok: boolean;
  label: string;
  warn?: string;
}) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
      ) : (
        <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden />
      )}
      <span className={ok ? "text-foreground" : "text-amber-600 dark:text-amber-400"}>
        {ok ? label : warn ?? label}
      </span>
    </li>
  );
}
