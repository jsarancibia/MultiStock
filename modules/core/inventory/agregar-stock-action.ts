"use server";

import { revalidatePath } from "next/cache";
import { createStockMovement } from "@/modules/core/stock-movements/actions";

export type AgregarStockState = { success?: boolean; message?: string };

export async function agregarStockRapidoAction(
  _prev: AgregarStockState | undefined,
  formData: FormData
): Promise<AgregarStockState | undefined> {
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity"));
  if (!productId || quantity <= 0) return { message: "Cantidad invalida." };

  const result = await createStockMovement({
    productId,
    type: "purchase",
    quantity,
    reason: "Carga rapida desde inventario",
  });

  if (!result.ok) return { message: result.message };

  revalidatePath("/inventario");
  return { success: true, message: `+${quantity} unidades agregadas.` };
}
