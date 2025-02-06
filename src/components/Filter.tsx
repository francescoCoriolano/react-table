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

  return (
    <select
      className="w-[8rem] text-black bg-slate-200"
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString() || "All"}
    >
      <option value="">All</option>
      <option value="beauty">beauty</option>
      <option value="fragrances">fragrances</option>
      <option value="furniture">furniture</option>
      <option value="groceries">groceries</option>
    </select>
  );
};

export default Filter;
