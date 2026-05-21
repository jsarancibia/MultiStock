"use client";

import Link from "next/link";
import { useState } from "react";
import { Package, Pencil, Trash2 } from "lucide-react";
import type { BusinessType } from "@/config/business-types";
import { marginPercentOnCost } from "@/lib/business/business-type-config";
import { cn, formatCurrency, formatQuantity } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineProductEditor } from "@/components/productos/inline-product-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteProductAction } from "@/modules/core/products/actions";

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_type: string;
  sale_price: string;
  cost_price: string;
  current_stock: string;
  min_stock: string;
  active: boolean;
  metadata: unknown;
  categories: { name: string } | null;
  suppliers: { name: string } | null;
  supplier_id: string | null;
  category_id: string | null;
};

type ProductsTableProps = {
  businessType: BusinessType;
  products: ProductRow[];
  suppliers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  isEmployee?: boolean;
};

function meta(m: unknown) {
  return m && typeof m === "object" ? (m as Record<string, unknown>) : {};
}

export function ProductsTable({ businessType, products, suppliers, categories, isEmployee = false }: ProductsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  if (!products.length) {
    return (
      <EmptyState
        icon={<Package aria-hidden />}
        title="No hay productos para mostrar"
        description="Crea el primero o prueba otro criterio de búsqueda o filtros."
        action={
          !isEmployee ? (
            <Link href="/productos/nuevo" className={cn(buttonVariants())}>
              Crear producto
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Nombre</th>
            {businessType === "ferreteria" ? (
              <th className="px-3 py-2 font-medium">Tecnico</th>
            ) : null}
            {businessType === "almacen" ? <th className="px-3 py-2 font-medium">Margen</th> : null}
            {businessType === "verduleria" ? <th className="px-3 py-2 font-medium">Unidad / rubro</th> : null}
            <th className="px-3 py-2 font-medium">Categoria</th>
            <th className="px-3 py-2 font-medium">Proveedor</th>
            <th className="px-3 py-2 font-medium">Stock</th>
            <th className="px-3 py-2 font-medium">Precio</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const m = meta(product.metadata);
            const cost = Number(product.cost_price);
            const sale = Number(product.sale_price);
            const margin = marginPercentOnCost(cost, sale);
            const ferreteriaLine = [m.brand, m.measure, m.model].filter(
              (x) => typeof x === "string" && x.trim()
            ) as string[];

            if (editingId === product.id) {
              return (
                <tr key={product.id} className="border-t">
                  <td colSpan={10} className="px-3 py-2">
                    <InlineProductEditor
                      productId={product.id}
                      initialSupplierId={product.supplier_id}
                      initialCategoryId={product.category_id}
                      initialSalePrice={product.sale_price}
                      initialCostPrice={product.cost_price}
                      initialActive={product.active}
                      suppliers={suppliers}
                      categories={categories}
                      onSaved={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              );
            }

            return (
              <tr key={product.id} className="border-t">
                <td className="px-3 py-2">
                  <Link href={`/productos/${product.id}`} className="font-medium underline-offset-4 hover:underline">
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {product.sku || product.barcode || "Sin SKU/codigo"}
                    {m.fast_rotation === true && businessType === "almacen" ? (
                      <span className="ml-1 rounded bg-amber-100 px-1 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                        rotacion
                      </span>
                    ) : null}
                    {m.is_perishable === true && businessType === "verduleria" ? (
                      <span className="ml-1 rounded bg-emerald-100 px-1 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                        perecible
                      </span>
                    ) : null}
                  </p>
                </td>
                {businessType === "ferreteria" ? (
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {ferreteriaLine.length ? ferreteriaLine.join(" · ") : "—"}
                  </td>
                ) : null}
                {businessType === "almacen" ? (
                  <td className="px-3 py-2">
                    {margin === null ? "—" : `${margin.toFixed(0)}%`}
                  </td>
                ) : null}
                {businessType === "verduleria" ? (
                  <td className="px-3 py-2">
                    <span className="font-medium uppercase">{product.unit_type}</span>
                    {m.allows_weight_sale === true ? <span className="text-xs text-muted-foreground"> · peso</span> : null}
                  </td>
                ) : null}
                <td className="px-3 py-2">{product.categories?.name ?? "-"}</td>
                <td className="px-3 py-2">{product.suppliers?.name ?? "-"}</td>
                <td className="px-3 py-2">
                  {formatQuantity(product.current_stock)} / min {formatQuantity(product.min_stock)}
                </td>
                <td className="px-3 py-2">{formatCurrency(product.sale_price)}</td>
                <td className="px-3 py-2">{product.active ? "Activo" : "Inactivo"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {!isEmployee && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(product.id)}
                        className="gap-1"
                      >
                        <Pencil className="size-3" aria-hidden />
                        Editar
                      </Button>
                    )}
                    {!isEmployee && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(product.id)}
                        className="gap-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" aria-hidden />
                      </Button>
                    )}
                    {isEmployee && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Eliminar producto"
        description="¿Estás seguro? Esta acción no se puede deshacer. El producto se eliminará permanentemente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={async () => {
          if (!deletingId) return;
          setPendingDelete(true);
          await deleteProductAction(deletingId);
          setDeletingId(null);
          setPendingDelete(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
