import { formatCurrency } from "@/lib/utils";

export type BoletaItem = {
  name: string;
  quantity: number;
  total: number;
};

export type BoletaData = {
  businessName: string;
  saleId: string;
  date: string;
  paymentMethod: string;
  items: BoletaItem[];
  total: number;
};

const W = 40;

const COL_NAME = 20;
const COL_QTY = 6;
const COL_PRICE = 12;

function padEnd(text: string, length: number): string {
  if (text.length > length) return text.slice(0, length - 1) + "\u2026";
  return text + " ".repeat(length - text.length);
}

function padStart(text: string, length: number): string {
  if (text.length > length) return text.slice(0, length);
  return " ".repeat(length - text.length) + text;
}

function center(text: string): string {
  const total = W - text.length;
  if (total <= 0) return text.slice(0, W);
  const left = Math.floor(total / 2);
  return " ".repeat(left) + text + " ".repeat(total - left);
}

function formatHeader(): string {
  const nameHeader = padEnd("PRODUCTO", COL_NAME);
  const qtyHeader = padStart("CANT", COL_QTY);
  const priceHeader = padStart("TOTAL", COL_PRICE);
  return `${nameHeader} ${qtyHeader} ${priceHeader}`;
}

function formatItemLine(items: BoletaItem[]): string {
  return items
    .map((item) => {
      const name = padEnd(item.name, COL_NAME);
      const qty = item.quantity % 1 === 0
        ? String(Math.round(item.quantity))
        : String(Number(item.quantity.toFixed(3)));
      const qtyPadded = padStart(qty, COL_QTY);
      const price = formatCurrency(item.total);
      const pricePadded = padStart(price, COL_PRICE);
      return `${name} ${qtyPadded} ${pricePadded}`;
    })
    .join("\n");
}

function formatTotalLine(label: string, totalFormatted: string): string {
  const priceColStart = COL_NAME + 1 + COL_QTY + 1;
  const labelPadded = padEnd(label, priceColStart);
  return labelPadded + padStart(totalFormatted, W - priceColStart);
}

function formatDateForBoleta(iso: string): string {
  const date = new Date(iso);
  return date
    .toLocaleString("es-CL", {
      timeZone: "America/Santiago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  debit: "Debito",
  credit: "Credito",
  transfer: "Transferencia",
  other: "Otro",
};

export function buildBoletaHTML(data: BoletaData): string {
  const line = "=".repeat(W);
  const midLine = "-".repeat(W);
  const dateFormatted = formatDateForBoleta(data.date);
  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod;
  const receiptNum = data.saleId.slice(0, 6).toUpperCase();
  const itemsLines = formatItemLine(data.items);
  const totalStr = formatCurrency(data.total);
  const header = formatHeader();

  const content = [
    line,
    center("MULTISTOCK"),
    center(data.businessName),
    line,
    "",
    "BOLETA DE VENTA",
    `N\u00B0 ${receiptNum}`,
    `Fecha: ${dateFormatted}`,
    `M\u00E9todo pago: ${paymentLabel}`,
    "",
    midLine,
    header,
    midLine,
    itemsLines,
    midLine,
    "",
    formatTotalLine("Subtotal:", totalStr),
    midLine,
    formatTotalLine("TOTAL:", totalStr),
    line,
    "",
    center("\u00A1Gracias por su compra!"),
    center("Vuelva pronto"),
    line,
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Boleta ${receiptNum}</title>
<style>
  * { margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Courier New", monospace;
    font-size: 11px;
    line-height: 1.2;
    color: #000;
    background: #fff;
    padding: 2mm;
    white-space: pre;
  }
  @page {
    size: 80mm auto;
    margin: 0;
  }
  .no-print { display: none; }
  @media screen {
    .no-print { display: block; margin: 12px auto 0; padding: 8px 24px;
      font-size: 14px; font-family: system-ui, sans-serif; cursor: pointer;
      border: 1px solid #ccc; border-radius: 6px; background: #f5f5f5; }
  }
</style>
</head>
<body>${content}
<button class="no-print" onclick="window.close()">Cerrar</button>
<script>
  window.onload = function() {
    window.print();
  }
</script>
</body>
</html>`;
}

export function openBoletaWindow(data: BoletaData): Window | null {
  const html = buildBoletaHTML(data);
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) return null;
  w.document.write(html);
  w.document.close();
  w.focus();
  return w;
}
