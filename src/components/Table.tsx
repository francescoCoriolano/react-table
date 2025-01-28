"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/api/getData";
import { Product } from "@/api/getData";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<Product>();

const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.brand, {
    id: "brand",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Brand</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("category", {
    header: () => <span>Category</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("price", {
    header: "Price",
    footer: (info) => info.column.id,
  }),
];

const Table = () => {
  function useProducts() {
    return useQuery({
      queryKey: ["products"],
      queryFn: fetchProducts,
    });
  }
  const { data, error, isLoading } = useProducts();

  // here we have ( all 3 mandatory! )
  // 1-the Data,
  // 2-the Column structure
  // getCoreRowModel() will create
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  //const rowSelection = table.getState().rowSelection; //read the row selection state
  //const setRowSelection = table.setRowSelection((old) => ({ ...old })); //set the row selection state
  //const resetRowSelection = table.resetRowSelection(); //reset the row selection state
  //console.log("rowSelection", rowSelection);
  //console.log("setRowSelection", setRowSelection);
  //console.log("resetRowSelection", resetRowSelection);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div className="pt-[10rem]">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
