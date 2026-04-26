"use client";

import { useActionState } from "react";
import type { BusinessType } from "@/config/business-types";
import type { ProductActionState } from "@/modules/core/products/actions";
import { ProductRubroFields } from "@/components/productos/product-rubro-fields";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string };
type ProductLike = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  cost_price: string;
  sale_price: string;
  min_stock: string;
  current_stock: string;
  category_id: string | null;
  supplier_id: string | null;
  active: boolean;
  metadata: unknown;
};

type ProductFormProps = {
  businessType: BusinessType;
  categories: Option[];
  suppliers: Option[];
  action: (
    prevState: ProductActionState | undefined,
    formData: FormData
  ) => Promise<ProductActionState | undefined>;
  submitLabel: string;
  initialProduct?: ProductLike | null;
  allowInitialStockEdit?: boolean;
};

const initialState: ProductActionState = {};

export function ProductForm({
  businessType,
  categories,
  suppliers,
  action,
  submitLabel,
  initialProduct,
  allowInitialStockEdit = true,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const metadata =
    initialProduct?.metadata && typeof initialProduct.metadata === "object"
      ? (initialProduct.metadata as Record<string, unknown>)
      : null;

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre
          </label>
          <input id="name" name="name" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.name ?? ""} required />
        </div>

        <div className="space-y-1">
          <label htmlFor="unitType" className="text-sm font-medium">
            Unidad
          </label>
          <select id="unitType" name="unitType" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.unit_type ?? "unit"}>
            <option value="unit">Unidad</option>
            <option value="kg">Kg</option>
            <option value="g">Gramo</option>
            <option value="box">Caja</option>
            <option value="liter">Litro</option>
            <option value="meter">Metro</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Categoria
          </label>
          <select id="categoryId" name="categoryId" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.category_id ?? ""}>
            <option value="">Sin categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="supplierId" className="text-sm font-medium">
            Proveedor
          </label>
          <select id="supplierId" name="supplierId" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.supplier_id ?? ""}>
            <option value="">Sin proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="sku" className="text-sm font-medium">
            SKU
          </label>
          <input id="sku" name="sku" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.sku ?? ""} />
        </div>

        <div className="space-y-1">
          <label htmlFor="barcode" className="text-sm font-medium">
            Codigo de barras
          </label>
          <input id="barcode" name="barcode" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.barcode ?? ""} />
        </div>

        <div className="space-y-1">
          <label htmlFor="costPrice" className="text-sm font-medium">
            Precio costo
          </label>
          <input id="costPrice" name="costPrice" type="number" step="0.0001" min="0" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.cost_price ?? "0"} />
        </div>

        <div className="space-y-1">
          <label htmlFor="salePrice" className="text-sm font-medium">
            Precio venta
          </label>
          <input id="salePrice" name="salePrice" type="number" step="0.0001" min="0" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.sale_price ?? "0"} />
        </div>

        <div className="space-y-1">
          <label htmlFor="minStock" className="text-sm font-medium">
            Stock minimo
          </label>
          <input id="minStock" name="minStock" type="number" step="0.0001" min="0" className="w-full rounded-md border px-3 py-2 text-sm" defaultValue={initialProduct?.min_stock ?? "0"} />
        </div>

        <div className="space-y-1">
          <label htmlFor="currentStock" className="text-sm font-medium">
            Stock actual
          </label>
          <input
            id="currentStock"
            name="currentStock"
            type="number"
            step="0.0001"
            min="0"
            className="w-full rounded-md border px-3 py-2 text-sm"
            defaultValue={initialProduct?.current_stock ?? "0"}
            readOnly={!allowInitialStockEdit}
          />
          {!allowInitialStockEdit ? (
            <p className="text-xs text-muted-foreground">
              El stock se actualiza desde Inventario - Movimientos.
            </p>
          ) : null}
        </div>
      </div>

      <ProductRubroFields businessType={businessType} metadata={metadata} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initialProduct?.active ?? true} />
        Producto activo
      </label>

      {state?.message ? <p className="text-sm text-destructive">{state.message}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
