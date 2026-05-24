"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BoletaData } from "@/lib/printing/print-boleta";
import { openBoletaWindow } from "@/lib/printing/print-boleta";

type SaleItem = {
  quantity: string | number;
  unit_price: string | number;
  subtotal: string | number;
  products: {
    name: string;
  } | null;
};

type SaleData = {
  id: string;
  total: string | number;
  payment_method: string | null;
  created_at: string;
  sale_items: SaleItem[] | null;
};

type BoletaPrintWrapperProps = {
  sale: SaleData;
  businessName: string;
  autoPrint?: boolean;
};

function saleToBoletaData(sale: SaleData, businessName: string): BoletaData {
  return {
    businessName,
    saleId: sale.id,
    date: sale.created_at,
    paymentMethod: sale.payment_method ?? "cash",
    items: (sale.sale_items ?? []).map((item) => ({
      name: item.products?.name ?? "Producto eliminado",
      quantity: Number(item.quantity),
      total: Number(item.subtotal),
    })),
    total: Number(sale.total),
  };
}

export function BoletaPrintWrapper({ sale, businessName, autoPrint = false }: BoletaPrintWrapperProps) {
  useEffect(() => {
    if (!autoPrint) return;
    const data = saleToBoletaData(sale, businessName);
    openBoletaWindow(data);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Button
      variant="outline"
      size="lg"
      className="min-h-11 w-full justify-center px-4 text-base font-medium sm:w-auto sm:min-w-[220px]"
      onClick={() => {
        const data = saleToBoletaData(sale, businessName);
        openBoletaWindow(data);
      }}
    >
      <Printer className="mr-2 size-4" />
      Imprimir boleta
    </Button>
  );
}
