"use client";

import { useActionState, useMemo, useState } from "react";
import { panelInputClass, formSecondaryButtonClass } from "@/components/ui/form-field-styles";
import { FormMessage } from "@/components/ui/form-message";
import { Button } from "@/components/ui/button";
import { quickCreateCustomerAction, type CreditCustomerBasic } from "@/modules/core/credit/actions";

type CreditCustomerSelectProps = {
  customers: CreditCustomerBasic[];
  value: string;
  onChange: (customerId: string) => void;
};

const quickCreateInitial = {};

export function CreditCustomerSelect({ customers, value, onChange }: CreditCustomerSelectProps) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q));
  }, [customers, search]);

  const selected = customers.find((c) => c.id === value);

  if (customers.length === 0 && !showCreate) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Cliente fiado</p>
        <p className="text-xs text-muted-foreground">
          No hay clientes registrados. Crea uno para vender a crédito.
        </p>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className={formSecondaryButtonClass}
        >
          + Nuevo cliente
        </button>
        {showCreate && (
          <QuickCreateForm
            onCreated={(id) => {
              onChange(id);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Cliente fiado</p>

      {selected ? (
        <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
          <span>
            <span className="font-medium">{selected.name}</span>
            <span className="ml-2 text-muted-foreground">
              (deuda: ${selected.current_balance.toLocaleString("es-CL")})
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSearch("");
            }}
            className="text-xs text-muted-foreground underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={panelInputClass}
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto rounded-md border border-input">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                {search.trim()
                  ? "Sin resultados. Crea un nuevo cliente."
                  : "Sin clientes disponibles."}
              </div>
            ) : (
              filtered.map((c) => {
                const ratio = c.credit_limit > 0 ? c.current_balance / c.credit_limit : 0;
                const debtColor = ratio > 0.8 ? "text-red-600" : ratio > 0.5 ? "text-amber-600" : "text-muted-foreground";
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setSearch("");
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 border-b border-input last:border-0 text-left"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className={debtColor}>
                      ${c.current_balance.toLocaleString("es-CL")}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {!showCreate && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="text-xs text-primary underline"
            >
              + Nuevo cliente
            </button>
          )}
        </div>
      )}

      {showCreate && (
        <QuickCreateForm
          onCreated={(id) => {
            onChange(id);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

type QuickCreateFormProps = {
  onCreated: (customerId: string) => void;
  onCancel: () => void;
};

function QuickCreateForm({ onCreated, onCancel }: QuickCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await quickCreateCustomerAction(undefined, formData);
      if (result?.customerId) {
        onCreated(result.customerId);
      }
      return result ?? {};
    },
    quickCreateInitial
  );

  return (
    <div className="rounded-md border border-input bg-muted/30 p-3 space-y-2">
      <p className="text-xs font-medium text-foreground">Nuevo cliente rápido</p>
      <form action={formAction} className="space-y-2">
        <input
          name="name"
          placeholder="Nombre *"
          required
          className={panelInputClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <input name="rut" placeholder="RUT (opcional)" className={panelInputClass} />
          <input name="phone" placeholder="Teléfono (opcional)" className={panelInputClass} />
        </div>
        <input
          name="creditLimit"
          type="number"
          min="0"
          step="100"
          placeholder="Límite $ (0 = sin crédito)"
          defaultValue="0"
          className={panelInputClass}
        />
        <FormMessage message={(state as { message?: string })?.message} />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Creando..." : "Crear"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
