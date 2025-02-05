import { Column, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Allows us to define custom properties for our columns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Filter = ({ column }: { column: Column<any, unknown> }) => {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  if (filterVariant === "select") {
    return (
      <select
        style={{ backgroundColor: "red" }}
        onChange={(e) => column.setFilterValue(e.target.value)}
        value={columnFilterValue?.toString()}
      >
        {/* See faceted column filters example for dynamic select options */}
        <option value="">All</option>
        <option value="beauty">beauty</option>
        <option value="fragrances">fragrances</option>
        <option value="furniture">furniture</option>
        <option value="groceries">groceries</option>
      </select>
    );
  } else if (filterVariant === "text") {
    return (
      <input
        value={columnFilterValue?.toString() || ""}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder="Filter by brand..."
        className="text-black bg-slate-200"
      />
    );
  } else {
    return null;
  }
};

export default Filter;
