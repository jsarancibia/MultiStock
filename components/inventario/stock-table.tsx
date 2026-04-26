import Link from "next/link";
import type { Database } from "@/types/database";

type StockProduct = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name" | "unit_type" | "current_stock" | "min_stock" | "sku" | "barcode"
>;

type StockTableProps = {
  products: StockProduct[];
};

export function StockTable({ products }: StockTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Unidad</th>
            <th className="px-3 py-2 font-medium">Stock actual</th>
            <th className="px-3 py-2 font-medium">Stock minimo</th>
            <th className="px-3 py-2 font-medium">Codigo</th>
            <th className="px-3 py-2 font-medium">Historial</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const lowStock = Number(product.current_stock) <= Number(product.min_stock);
            return (
              <tr key={product.id} className="border-t">
                <td className="px-3 py-2 font-medium">{product.name}</td>
                <td className="px-3 py-2">{product.unit_type}</td>
                <td className={`px-3 py-2 ${lowStock ? "text-destructive" : ""}`}>{product.current_stock}</td>
                <td className="px-3 py-2">{product.min_stock}</td>
                <td className="px-3 py-2">{product.sku || product.barcode || "-"}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/inventario/productos/${product.id}/movimientos`}
                    className="underline underline-offset-4"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            );
          })}
          {!products.length ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                No hay productos activos en inventario.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
