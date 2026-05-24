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

function padEnd(text: string, length: number): string {
  return text.length >= length ? text.slice(0, length) : text + " ".repeat(length - text.length);
}

function padStart(text: string, length: number): string {
  return text.length >= length ? text.slice(0, length) : " ".repeat(length - text.length) + text;
}

function formatItemLine(boleta: BoletaData): string {
  const maxName = 20;
  const maxQty = 4;
  const maxPrice = 10;

  return boleta.items
    .map((item) => {
      const name = padEnd(item.name.slice(0, maxName), maxName);
      const qty = item.quantity % 1 === 0
        ? String(Math.round(item.quantity))
        : String(Number(item.quantity.toFixed(3)));
      const qtyPadded = padStart(qty, maxQty);
      const price = formatCurrency(item.total);
      const pricePadded = padStart(price, maxPrice);
      return `${name} ${qtyPadded} ${pricePadded}`;
    })
    .join("\n");
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
  const line = "=".repeat(34);
  const midLine = "-".repeat(34);
  const dateFormatted = formatDateForBoleta(data.date);
  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod;
  const receiptNum = data.saleId.slice(0, 6).toUpperCase();
  const itemsLines = formatItemLine(data);
  const totalFormatted = padStart(formatCurrency(data.total), 10);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Boleta ${receiptNum}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Consolas", "Courier New", "Liberation Mono", monospace;
    font-size: 13px;
    line-height: 1.3;
    color: #000;
    background: #fff;
    padding: 12px 8px;
    max-width: 320px;
    margin: 0 auto;
  }
  @page {
    size: auto;
    margin: 0mm;
  }
  @media print {
    body {
      max-width: none;
      padding: 4mm 2mm;
    }
    .no-print { display: none !important; }
  }
  .line { white-space: pre; font-weight: bold; }
  .title { white-space: pre; font-weight: bold; text-align: center; }
  .section { white-space: pre; }
  .center { text-align: center; white-space: pre-line; }
  .footer { text-align: center; white-space: pre-line; margin-top: 8px; }
  .close-btn {
    display: block;
    margin: 12px auto 0;
    padding: 8px 24px;
    font-size: 14px;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #f5f5f5;
  }
</style>
</head>
<body>
<div class="title">
${line}
         MULTISTOCK
      ${data.businessName}
${line}
</div>
<div class="section">
BOLETA DE VENTA
N\u00B0 ${receiptNum}
Fecha: ${dateFormatted}
M\u00E9todo pago: ${paymentLabel}
</div>
<div class="line">${midLine}</div>
<div class="section">
PRODUCTO               CANT   TOTAL
${midLine}
${itemsLines}
</div>
<div class="line">${midLine}</div>
<div class="section">
Subtotal:            ${totalFormatted}
${midLine}
TOTAL:               ${totalFormatted}
</div>
<div class="title">${line}</div>
<div class="footer">\u00A1Gracias por su compra!
Vuelva pronto</div>
<div class="title">${line}</div>
<button class="close-btn no-print" onclick="window.close()">Cerrar</button>
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
