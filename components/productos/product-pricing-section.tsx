import {
  formSectionClass,
  panelInputClass,
} from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";

type ProductPricingSectionProps = {
  showAdvanced: boolean;
  salePriceDefault: string;
  currentStockDefault: string;
  costPriceDefault: string;
  minStockDefault: string;
  allowInitialStockEdit: boolean;
  salePriceError?: string;
  currentStockError?: string;
};

export function ProductPricingSection({
  showAdvanced,
  salePriceDefault,
  currentStockDefault,
  costPriceDefault,
  minStockDefault,
  allowInitialStockEdit,
  salePriceError,
  currentStockError,
}: ProductPricingSectionProps) {
  return (
    <div className={formSectionClass}>
      <h2 className="mb-3 text-sm font-semibold text-foreground">2) Precio y stock</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="salePrice" className="text-sm font-medium text-foreground">
            Precio de venta *
          </label>
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.0001"
            min="0"
            className={panelInputClass}
            defaultValue={salePriceDefault}
          />
          <FormMessage message={salePriceError} />
        </div>
        <div className="space-y-1">
          <label htmlFor="currentStock" className="text-sm font-medium text-foreground">
            Stock inicial *
          </label>
          <input
            id="currentStock"
            name="currentStock"
            type="number"
            step="0.0001"
            min="0"
            className={panelInputClass}
            defaultValue={currentStockDefault}
            readOnly={!allowInitialStockEdit}
          />
          <FormMessage message={currentStockError} />
        </div>

        {showAdvanced ? (
          <>
            <div className="space-y-1">
              <label htmlFor="costPrice" className="text-sm font-medium text-foreground">
                Precio de costo
              </label>
              <input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.0001"
                min="0"
                className={panelInputClass}
                defaultValue={costPriceDefault}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="minStock" className="text-sm font-medium text-foreground">
                Stock mínimo
              </label>
              <input
                id="minStock"
                name="minStock"
                type="number"
                step="0.0001"
                min="0"
                className={panelInputClass}
                defaultValue={minStockDefault}
              />
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="costPrice" value={costPriceDefault} />
            <input type="hidden" name="minStock" value={minStockDefault} />
          </>
        )}
      </div>
    </div>
  );
}
