"use client";

import { cn } from "@/lib/utils";
import { panelInputClass, panelSelectClass } from "@/components/ui/form-field-styles";

type FilterOption = { value: string; label: string };

type ProductFilterBarProps = {
  defaultValues: {
    q: string;
    categoryId: string;
    supplierId: string;
    status: string;
    focus: string;
  };
  searchPlaceholder: string;
  categories: FilterOption[];
  suppliers: FilterOption[];
  focusOptions: FilterOption[];
};

export function ProductFilterBar({
  defaultValues,
  searchPlaceholder,
  categories,
  suppliers,
  focusOptions,
}: ProductFilterBarProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground sm:grid-cols-4">
      <input
        name="q"
        placeholder={searchPlaceholder}
        defaultValue={defaultValues.q}
        className={cn(panelInputClass, "sm:col-span-2")}
      />
      <select
        name="categoryId"
        defaultValue={defaultValues.categoryId}
        className={panelSelectClass}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      <select
        name="supplierId"
        defaultValue={defaultValues.supplierId}
        className={panelSelectClass}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="">Todos los proveedores</option>
        {suppliers.map((sup) => (
          <option key={sup.value} value={sup.value}>
            {sup.label}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={defaultValues.status}
        className={panelSelectClass}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        <option value="all">Todos</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
      </select>
      <select
        name="focus"
        defaultValue={defaultValues.focus}
        className={cn(panelSelectClass, "sm:col-span-2")}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {focusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </form>
  );
}
