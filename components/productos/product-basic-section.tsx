"use client";

import { ProductBarcodeField } from "@/components/productos/product-barcode-field";
import {
  formSectionClass,
  panelInputClass,
  panelSelectClass,
} from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";

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
                className={panelSelectClass}
                defaultValue={categoryIdDefault}
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

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

            <ProductBarcodeField
              defaultValue={barcodeDefault}
              instanceKey={productInstanceKey ?? ""}
              allowMobileLink={allowMobileBarcodeLink}
            />
          </>
        ) : (
          <>
            <input type="hidden" name="categoryId" value={categoryIdDefault} />
            <input type="hidden" name="supplierId" value={supplierIdDefault} />
            <input type="hidden" name="sku" value={skuDefault} />
            <ProductBarcodeField
              defaultValue={barcodeDefault}
              instanceKey={productInstanceKey ?? ""}
              allowMobileLink={allowMobileBarcodeLink}
            />
          </>
        )}
      </div>
    </div>
  );
}
