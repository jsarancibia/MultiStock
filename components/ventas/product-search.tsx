"use client";

import { useMemo, useState } from "react";
import type { BusinessType } from "@/config/business-types";

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

export function ProductSearch({ businessType, products, onAddProduct }: ProductSearchProps) {
  const [query, setQuery] = useState("");

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

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="font-medium">Buscar productos</h2>
      {businessType === "verduleria" ? (
        <p className="text-xs text-muted-foreground">
          En kg o g podes vender con decimales (ej. 0,5 o 1,25). Otras unidades son enteras.
        </p>
      ) : null}
      {businessType === "ferreteria" ? (
        <p className="text-xs text-muted-foreground">Se muestran marca, medida y SKU para evitar confusiones.</p>
      ) : null}
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder={placeholder}
      />
      <div className="max-h-72 overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Precio</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {businessType === "ferreteria"
                      ? ferreteriaDetailLine(product)
                      : product.barcode || product.sku || "Sin codigo"}
                  </p>
                </td>
                <td className="px-3 py-2">
                  {product.current_stock} {product.unit_type}
                </td>
                <td className="px-3 py-2">${product.sale_price}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onAddProduct(product)}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            ))}
            {!filteredProducts.length ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                  No hay coincidencias para tu busqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
