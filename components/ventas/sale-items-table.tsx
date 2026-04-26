"use client";

const DECIMAL_UNITS = new Set(["kg", "g", "liter", "meter"]);

function quantityInputAttrs(unitType: string) {
  if (DECIMAL_UNITS.has(unitType)) {
    return { min: 0.01, step: 0.01 } as const;
  }
  return { min: 1, step: 1 } as const;
}

export type SaleCartItem = {
  productId: string;
  name: string;
  unitType: string;
  stock: number;
  quantity: number;
  unitPrice: number;
};

type SaleItemsTableProps = {
  items: SaleCartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateUnitPrice: (productId: string, unitPrice: number) => void;
  onRemove: (productId: string) => void;
};

export function SaleItemsTable({
  items,
  onUpdateQuantity,
  onUpdateUnitPrice,
  onRemove,
}: SaleItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Cantidad</th>
            <th className="px-3 py-2 font-medium">Precio unit.</th>
            <th className="px-3 py-2 font-medium">Subtotal</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const subtotal = item.quantity * item.unitPrice;
            const qAttrs = quantityInputAttrs(item.unitType);
            return (
              <tr key={item.productId} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {item.stock} {item.unitType}
                  </p>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={qAttrs.min}
                    step={qAttrs.step}
                    value={item.quantity}
                    onChange={(event) => onUpdateQuantity(item.productId, Number(event.target.value))}
                    className="w-28 rounded-md border px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={item.unitPrice}
                    onChange={(event) => onUpdateUnitPrice(item.productId, Number(event.target.value))}
                    className="w-28 rounded-md border px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2">${subtotal.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            );
          })}
          {!items.length ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                Todavia no agregaste productos a la venta.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
