"use client";

import { useState } from "react";
import {
  formSectionClass,
  panelInputClass,
} from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";

type ProductPricingSectionProps = {
  salePriceDefault: string;
  currentStockDefault: string;
  costPriceDefault: string;
  minStockDefault: string;
  allowInitialStockEdit: boolean;
  salePriceError?: string;
  currentStockError?: string;
};

export function ProductPricingSection({
  salePriceDefault,
  currentStockDefault,
  costPriceDefault,
  minStockDefault,
  allowInitialStockEdit,
  salePriceError,
  currentStockError,
}: ProductPricingSectionProps) {
  const [costPrice, setCostPrice] = useState(costPriceDefault);
  const [salePrice, setSalePrice] = useState(salePriceDefault);

  const cost = Number(costPrice);
  const sale = Number(salePrice);
  const hasBoth = cost > 0 && sale > 0;
  const gain = sale - cost;
  const margin = cost > 0 ? ((sale - cost) / cost) * 100 : null;

  return (
    <div className={formSectionClass}>
      <h2 className="mb-3 text-sm font-semibold text-foreground">2) Precio y stock</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="costPrice" className="text-sm font-medium text-foreground">
            Precio de compra
          </label>
          <input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.0001"
            min="0"
            className={panelInputClass}
            defaultValue={costPriceDefault}
            onChange={(e) => setCostPrice(e.target.value)}
          />
        </div>
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
            onChange={(e) => setSalePrice(e.target.value)}
            required
          />
          <FormMessage message={salePriceError} />
        </div>
      </div>

      {/* Tarjeta visual de margen */}
      {hasBoth ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Ganancia estimada
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
                +{gain.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Margen estimado
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
                {margin !== null ? `${margin.toFixed(0)}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="currentStock" className="text-sm font-medium text-foreground">
            Stock actual *
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
      </div>
    </div>
  );
}
