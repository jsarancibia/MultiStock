"use server";

import { revalidatePath } from "next/cache";
import { createStockMovement } from "@/modules/core/stock-movements/actions";

export type ReducirStockState = { success?: boolean; message?: string };

export async function reducirStockRapidoAction(
  _prev: ReducirStockState | undefined,
  formData: FormData
): Promise<ReducirStockState | undefined> {
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity"));
  if (!productId || quantity <= 0) return { message: "Cantidad invalida." };

  const result = await createStockMovement({
    productId,
    type: "adjustment",
    quantity: -quantity,
    reason: "Reduccion rapida desde inventario",
  });

  if (!result.ok) return { message: result.message };

  revalidatePath("/inventario");
  return { success: true, message: `-${quantity} unidades reducidas.` };
}
