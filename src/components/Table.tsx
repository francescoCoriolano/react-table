"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, Product } from "@/api/getData";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { Row } from "@tanstack/react-table";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { mkConfig, generateCsv, download } from "export-to-csv";

// Create a column helper for the Product type
const columnHelper = createColumnHelper<Product>();

// Define the columns for the table
const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.brand, {
    id: "brand",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Brand</span>,
  }),
  columnHelper.accessor("title", {
    header: () => "Title",
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor("category", {
    header: () => <span>Category</span>,
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
  }),
  columnHelper.accessor("price", {
    header: "Price",
  }),
];

// Define the TableComponent
const TableComponent = () => {
  // Custom hook to fetch products using react-query
  function useProducts() {
    return useQuery<Product[]>({
      queryKey: ["products"],
      queryFn: fetchProducts,
    });
  }

  // Fetch products data
  const { data, error, isLoading, refetch } = useProducts();

  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, []);

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Initialize the table with react-table
  const table = useReactTable({
    columns,
    data: data ?? [], // Provide an empty array if data is undefined
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: "sample", // export file name (without .csv)
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  // export function DOWNLOAD
  const exportExcel = (rows: Row<Product>[]) => {
    const rowData = rows.map((row) => {
      const original = row.original;
      return {
        id: original.id,
        brand: original.brand,
        title: original.title,
        category: original.category,
        rating: original.rating,
        price: original.price,
      };
    });
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  // Display loading state
  if (isLoading) return <div>Loading...</div>;

  // Display error state
  if (error) return <div>Error loading products</div>;

  // Render the table
  return (
    <div className="pt-10">
      <TableContainer component={Paper}>
        <Table sx={{ width: 950 }} aria-label="simple table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      // this allow sorting on Click
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {/* here is the header text */}
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {/* here we show arrows for Sorting */}
                      {/* {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null} */}

                      {/* Uncomment the following lines to enable filtering */}
                      {/* {header.column.getCanFilter() && (
                        <Filter column={header.column} table={table} />
                      )} */}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} component="th" scope="row">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex items-center justify-end gap-2 p-5 ">
        <button
          className="border rounded px-4 py-2 cursor-pointer  hover:bg-slate-500"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded px-4 py-2 cursor-pointer  hover:bg-slate-500"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded px-4 py-2 cursor-pointer  hover:bg-slate-500"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded px-4 py-2 cursor-pointer  hover:bg-slate-500"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1 mx-4">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        <button
          className="border rounded px-4 py-2 cursor-pointer  hover:bg-slate-500"
          type="button"
          onClick={() => exportExcel(table.getFilteredRowModel().rows)}
        >
          Downlaod
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
