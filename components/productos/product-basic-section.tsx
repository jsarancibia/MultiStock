"use client";

import { useState, useRef, useEffect } from "react";
import { ProductBarcodeField } from "@/components/productos/product-barcode-field";
import {
  formSectionClass,
  panelInputClass,
  panelSelectClass,
} from "@/components/ui/form-field-styles";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { createCategoryAction } from "@/modules/core/categories/actions";

type Option = { id: string; name: string };

type ProductBasicSectionProps = {
  showAdvanced: boolean;
  nameDefault: string;
  nameError?: string;
  unitTypeDefault: string;
  categoryIdDefault: string;
  supplierIdDefault: string;
  skuDefault: string;
  barcodeDefault: string;
  /** Para resetear el campo al cambiar de producto en edición */
  productInstanceKey?: string;
  categories: Option[];
  suppliers: Option[];
  allowMobileBarcodeLink?: boolean;
};

export function ProductBasicSection({
  showAdvanced,
  nameDefault,
  nameError,
  unitTypeDefault,
  categoryIdDefault,
  supplierIdDefault,
  skuDefault,
  barcodeDefault,
  productInstanceKey,
  categories,
  suppliers,
  allowMobileBarcodeLink = true,
}: ProductBasicSectionProps) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [localCategories, setLocalCategories] = useState(categories);
  const [catPending, setCatPending] = useState(false);
  const [pendingCatId, setPendingCatId] = useState<string | null>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (pendingCatId && categoryRef.current) {
      categoryRef.current.value = pendingCatId;
      setPendingCatId(null);
    }
  }, [pendingCatId]);

  async function handleCreateCategory() {
    if (!newCatName.trim()) return;
    setCatPending(true);
    const fd = new FormData();
    fd.set("name", newCatName.trim());
    const result = await createCategoryAction(undefined, fd);
    if (result?.createdId && result?.createdName) {
      setLocalCategories((prev) => [
        ...prev,
        { id: result.createdId!, name: result.createdName! },
      ]);
      setPendingCatId(result.createdId);
      setNewCatName("");
      setShowNewCategory(false);
    }
    setCatPending(false);
  }

  return (
    <div className={formSectionClass}>
      <h2 className="mb-3 text-sm font-semibold text-foreground">1) Datos básicos</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            className={panelInputClass}
            defaultValue={nameDefault}
            required
          />
          <FormMessage message={nameError} />
        </div>

        {showAdvanced ? (
          <div className="space-y-1">
            <label htmlFor="unitType" className="text-sm font-medium text-foreground">
              Unidad
            </label>
            <select
              id="unitType"
              name="unitType"
              className={panelSelectClass}
              defaultValue={unitTypeDefault}
            >
              <option value="unit">Unidad</option>
              <option value="kg">Kg</option>
              <option value="g">Gramo</option>
              <option value="box">Caja</option>
              <option value="liter">Litro</option>
              <option value="meter">Metro</option>
            </select>
          </div>
        ) : (
          <input type="hidden" name="unitType" value={unitTypeDefault} />
        )}

        {showAdvanced ? (
          <>
            <div className="space-y-1">
              <label htmlFor="categoryId" className="text-sm font-medium text-foreground">
                Categoría
              </label>
              <select
                id="categoryId"
                name="categoryId"
                ref={categoryRef}
                className={panelSelectClass}
                defaultValue={categoryIdDefault}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewCategory(true);
                  }
                }}
              >
                <option value="">Sin categoría</option>
                {localCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="__new__" className="font-medium text-primary">
                  + Nueva categoria
                </option>
              </select>
            </div>

            {showNewCategory && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Nombre de la nueva categoria
                </label>
                <div className="flex gap-2">
                  <input
                    className={panelInputClass}
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ej: Frutas, Bebidas..."
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={catPending || !newCatName.trim()}
                    onClick={handleCreateCategory}
                  >
                    {catPending ? "..." : "Crear"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCatName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="supplierId" className="text-sm font-medium text-foreground">
                Proveedor
              </label>
              <select
                id="supplierId"
                name="supplierId"
                className={panelSelectClass}
                defaultValue={supplierIdDefault}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="sku" className="text-sm font-medium text-foreground">
                SKU (opcional)
              </label>
              <input
                id="sku"
                name="sku"
                className={panelInputClass}
                defaultValue={skuDefault}
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <ProductBarcodeField
                defaultValue={barcodeDefault}
                instanceKey={productInstanceKey ?? ""}
                allowMobileLink={allowMobileBarcodeLink}
              />
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="categoryId" value={categoryIdDefault} />
            <input type="hidden" name="supplierId" value={supplierIdDefault} />
            <input type="hidden" name="sku" value={skuDefault} />
            <div className="min-w-0 sm:col-span-2">
              <ProductBarcodeField
                defaultValue={barcodeDefault}
                instanceKey={productInstanceKey ?? ""}
                allowMobileLink={allowMobileBarcodeLink}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
