export type ProductFromDb = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  current_stock: string;
  sale_price: string;
  active: boolean;
  metadata: Record<string, unknown> | null;
};

export type SaleFormProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  current_stock: string;
  sale_price: string;
  brand: string | null;
  model: string | null;
  measure: string | null;
};

function strMeta(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function mapProductForSale(row: ProductFromDb): SaleFormProduct {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.barcode,
    unit_type: row.unit_type,
    current_stock: row.current_stock,
    sale_price: row.sale_price,
    brand: strMeta(meta.brand),
    model: strMeta(meta.model),
    measure: strMeta(meta.measure),
  };
}
