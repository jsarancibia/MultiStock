"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { BusinessType } from "@/config/business-types";
import { BarcodeScanButton } from "@/components/barcode/barcode-scan-button";
import { MobileBarcodeLink } from "@/components/barcode/mobile-barcode-link";
import {
  formSecondaryButtonClass,
  panelInputClass,
} from "@/components/ui/form-field-styles";
import { isValidBarcodeFormat, normalizeBarcode } from "@/lib/barcode/normalize";
import { cn, formatCurrency, formatQuantity } from "@/lib/utils";
import { findActiveProductByBarcode } from "@/modules/core/products/actions";
import type { SaleFormProduct } from "@/lib/products/map-product-for-sale";

export type SaleProductOption = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  current_stock: string;
  sale_price: string;
  brand?: string | null;
  model?: string | null;
  measure?: string | null;
};

type ProductSearchProps = {
  businessType: BusinessType;
  products: SaleProductOption[];
  onAddProduct: (product: SaleProductOption) => void;
  allowMobileBarcodeLink?: boolean;
};

function almacenSearchScore(product: SaleProductOption, q: string): number {
  const n = q.trim().toLowerCase();
  if (!n) return 0;
  const name = product.name.toLowerCase();
  const sku = (product.sku ?? "").toLowerCase();
  const barcode = (product.barcode ?? "").toLowerCase();
  if (barcode && barcode === n) return 0;
  if (barcode && barcode.startsWith(n)) return 1;
  if (sku && sku === n) return 2;
  if (barcode && barcode.includes(n)) return 3;
  if (sku && sku.includes(n)) return 4;
  if (name.startsWith(n)) return 5;
  if (name.includes(n)) return 6;
  return 99;
}

function defaultSearchFilter(product: SaleProductOption, businessType: BusinessType, q: string): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  const name = product.name.toLowerCase();
  const sku = (product.sku ?? "").toLowerCase();
  const barcode = (product.barcode ?? "").toLowerCase();
  if (name.includes(n) || sku.includes(n) || barcode.includes(n)) return true;
  if (businessType === "ferreteria") {
    const brand = (product.brand ?? "").toLowerCase();
    const model = (product.model ?? "").toLowerCase();
    const measure = (product.measure ?? "").toLowerCase();
    if (brand.includes(n) || model.includes(n) || measure.includes(n)) return true;
  }
  return false;
}

function ferreteriaDetailLine(product: SaleProductOption): string {
  const parts = [product.sku, product.brand, product.model, product.measure].filter(
    (p): p is string => Boolean(p && String(p).trim())
  );
  return parts.length ? parts.join(" · ") : "Sin datos tecnicos";
}

function saleFormProductToOption(p: SaleFormProduct): SaleProductOption {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    unit_type: p.unit_type,
    current_stock: p.current_stock,
    sale_price: p.sale_price,
    brand: p.brand ?? undefined,
    model: p.model ?? undefined,
    measure: p.measure ?? undefined,
  };
}

export function ProductSearch({
  businessType,
  products,
  onAddProduct,
  allowMobileBarcodeLink = true,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastExactHitRef = useRef<string | null>(null);
  const [isScanPending, startTransition] = useTransition();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const applyScannedBarcode = useCallback(
    (code: string) => {
      startTransition(async () => {
        setScanMessage(null);
        const result = await findActiveProductByBarcode(code);
        if (result.ok) {
          onAddProduct(saleFormProductToOption(result.product));
          setQuery("");
        } else {
          setScanMessage(result.message);
        }
      });
    },
    [onAddProduct]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const placeholder =
    businessType === "almacen"
      ? "Codigo de barras, SKU o nombre (prioridad codigo)"
      : businessType === "ferreteria"
        ? "SKU, marca, medida o nombre"
        : "Nombre o identificador";

  const filteredProducts = useMemo(() => {
    const n = query.trim();
    if (!n) {
      return products.slice(0, 8);
    }

    const base = products.filter((p) => defaultSearchFilter(p, businessType, n));
    if (businessType === "almacen") {
      return [...base]
        .sort((a, b) => {
          const sa = almacenSearchScore(a, n);
          const sb = almacenSearchScore(b, n);
          if (sa !== sb) return sa - sb;
          return a.name.localeCompare(b.name, "es");
        })
        .slice(0, 12);
    }
    return base.slice(0, 12);
  }, [products, query, businessType]);

  const barcodeQueryNorm = normalizeBarcode(query.trim());
  const exactBarcodeMatch =
    isValidBarcodeFormat(barcodeQueryNorm)
      ? products.find((product) => normalizeBarcode(product.barcode ?? "") === barcodeQueryNorm)
      : null;

  useEffect(() => {
    if (!exactBarcodeMatch) return;
    if (lastExactHitRef.current === barcodeQueryNorm) return;
    lastExactHitRef.current = barcodeQueryNorm;
    onAddProduct(exactBarcodeMatch);
    setQuery("");
  }, [barcodeQueryNorm, exactBarcodeMatch, onAddProduct]);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <h2 className="font-medium text-foreground">Buscar productos</h2>
      {businessType === "verduleria" ? (
        <p className="text-xs text-muted-foreground">
          En kg o g puedes vender con decimales (ej. 0,5 o 1,25). Otras unidades son enteras.
        </p>
      ) : null}
      {businessType === "ferreteria" ? (
        <p className="text-xs text-muted-foreground">Se muestran marca, medida y SKU para evitar confusiones.</p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setScanMessage(null);
            lastExactHitRef.current = null;
          }}
          className={cn(panelInputClass, "min-w-0 flex-1")}
          placeholder={placeholder}
        />
        <BarcodeScanButton
          className={formSecondaryButtonClass}
          continuousScan
          disabled={isScanPending}
          label={isScanPending ? "Buscando..." : "Escanear código"}
          onDetected={applyScannedBarcode}
        />
        {allowMobileBarcodeLink ? (
          <MobileBarcodeLink
            className={formSecondaryButtonClass}
            disabled={isScanPending}
            onDetected={applyScannedBarcode}
          />
        ) : null}
      </div>
      {scanMessage ? <p className="text-xs text-rose-600">{scanMessage}</p> : null}
      {exactBarcodeMatch ? (
        <p className="text-xs text-emerald-600">
          Coincidencia exacta detectada por código: <span className="font-medium">{exactBarcodeMatch.name}</span>
        </p>
      ) : null}
      <div className="max-h-72 overflow-auto rounded-md border border-border bg-background">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="w-[48%] px-2 py-2 font-medium sm:px-3">Producto</th>
              <th className="w-[18%] px-2 py-2 font-medium sm:px-3">Stock</th>
              <th className="w-[18%] px-2 py-2 font-medium sm:px-3">Precio</th>
              <th className="w-[16%] px-2 py-2 font-medium sm:px-3" />
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-2 py-2 align-top sm:px-3">
                  <p className="break-words font-medium leading-snug">{product.name}</p>
                  <p className="mt-0.5 break-all text-[11px] text-muted-foreground sm:text-xs">
                    {businessType === "ferreteria"
                      ? ferreteriaDetailLine(product)
                      : product.barcode || product.sku || "Sin codigo"}
                  </p>
                </td>
                <td className="px-2 py-2 align-top text-[11px] sm:px-3 sm:text-sm">
                  <span className="break-words">
                    {formatQuantity(product.current_stock)} {product.unit_type}
                  </span>
                </td>
                <td className="px-2 py-2 align-top text-[11px] sm:px-3 sm:text-sm">{formatCurrency(product.sale_price)}</td>
                <td className="px-2 py-2 align-top text-right sm:px-3">
                  <button
                    type="button"
                    onClick={() => onAddProduct(product)}
                    className="rounded-md border border-input bg-background px-1.5 py-1 text-[11px] text-foreground hover:bg-muted sm:px-2 sm:text-xs"
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            ))}
            {!filteredProducts.length ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                  No hay coincidencias para tu búsqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
