"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, Product } from "@/api/getData";
import { useDebounce } from "@uidotdev/usehooks";

import Filter from "./Filter";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  filterFns,
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

// Define the columns
const columns = [
  columnHelper.accessor("id", {
    header: "Id",
    size: 50,
  }),
  columnHelper.accessor("brand", {
    header: "Brand",
    size: 150,
  }),
  columnHelper.accessor("title", {
    header: "Title",
    size: 200,
  }),
  columnHelper.accessor("category", {
    header: "Category",
    size: 100,
    meta: {
      filterVariant: "select",
    },
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    size: 100,
  }),
  columnHelper.accessor("price", {
    header: "Price",
    size: 100,
  }),
];

// Define the TableComponent
const TableOne = () => {
  // Custom hook to fetch products using react-query
  function useProducts() {
    return useQuery<Product[]>({
      queryKey: ["products"],
      queryFn: fetchProducts,
    });
  }

  // Fetch products data
  const { data, error, isLoading, refetch } = useProducts();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // State for column filters
  const [globalFilter, setGlobalFilter] = useState<string>(""); // State for global filter
  const debouncedGlobalFilter = useDebounce(globalFilter, 300); // Delay search updates
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  //Initialize the table with react-table
  const table = useReactTable({
    columns,
    data: data ?? [],
    debugTable: true,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    globalFilterFn: filterFns.includesString,
    state: {
      columnFilters,
      pagination,
      globalFilter: debouncedGlobalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: "sample",
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
      <div className="flex items-center justify-between">
        <div className="p-10 ">
          <h3>Filter globally:</h3>
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="text-black"
          />
        </div>
        <div className="p-10 ">
          <h3>Category Filters:</h3>
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) =>
              header.column.getCanFilter() && header.id === "category" ? (
                <div key={header.id}>
                  <Filter column={header.column} />
                </div>
              ) : null
            )
          )}
        </div>
      </div>
      <div className="overflow-x-auto w-[80vw]">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      style={{ width: header.column.columnDef.size }}
                    >
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
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="w-full h-[50vh] flex items-center justify-center">
                      <h4>No data available</h4>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} component="th" scope="row">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
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
          Download
        </button>
      </div>
    </div>
  );
};

export default TableOne;
