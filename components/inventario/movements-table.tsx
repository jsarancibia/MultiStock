type MovementRow = {
  id: string;
  type: string;
  quantity: string;
  reason: string | null;
  unit_cost: string | null;
  created_at: string;
  products: { name: string } | null;
};

type MovementsTableProps = {
  movements: MovementRow[];
};

const movementTypeLabels: Record<string, string> = {
  initial_stock: "Stock inicial",
  purchase: "Compra",
  adjustment: "Ajuste",
  waste: "Merma",
  return: "Devolucion",
  sale: "Venta",
};

export function MovementsTable({ movements }: MovementsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Tipo</th>
            <th className="px-3 py-2 font-medium">Cantidad</th>
            <th className="px-3 py-2 font-medium">Costo unit.</th>
            <th className="px-3 py-2 font-medium">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="border-t">
              <td className="px-3 py-2">{new Date(movement.created_at).toLocaleString("es-AR")}</td>
              <td className="px-3 py-2">{movement.products?.name ?? "-"}</td>
              <td className="px-3 py-2">{movementTypeLabels[movement.type] ?? movement.type}</td>
              <td className="px-3 py-2">{movement.quantity}</td>
              <td className="px-3 py-2">{movement.unit_cost ? `$${movement.unit_cost}` : "-"}</td>
              <td className="px-3 py-2">{movement.reason ?? "-"}</td>
            </tr>
          ))}
          {!movements.length ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                No hay movimientos registrados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
