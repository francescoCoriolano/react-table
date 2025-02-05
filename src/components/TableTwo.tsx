"use client";
import React, { useEffect, useState } from "react";
import { fetchProductsByCategory, Product } from "@/api/getData";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  filterFns,
  Row,
} from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
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
const TableComponent = () => {
  // State for category search term and results
  const [results, setResults] = useState<Product[]>([]);
  const [searchTermCategory, setSearchTermCategory] = useState("");
  const debouncedSearchTermCategory = useDebounce(searchTermCategory, 300);

  // Fetch products by category when search term changes
  useEffect(() => {
    const searchC = async () => {
      const dataCategory = await fetchProductsByCategory({
        queryKey: ["category", debouncedSearchTermCategory],
      });
      setResults(dataCategory || []);
    };
    searchC();
  }, [debouncedSearchTermCategory]);

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // State for global filter
  const [globalFilter, setGlobalFilter] = useState<string>("");
  //const debouncedSearchTermGlobal = useDebounce(globalFilter, 300);

  // Initialize the table with react-table
  const table = useReactTable({
    columns,
    data: results ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    globalFilterFn: filterFns.includesString,
    state: {
      pagination,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });
  // Configuration for CSV export
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: "sample",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  // Function to export table data to CSV
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
  // Handle focus events to clear the other input
  const handleGlobalFilterFocus = () => {
    setSearchTermCategory("");
  };

  const handleCategoryFocus = () => {
    setGlobalFilter("");
  };

  // // Display error state
  if (!results) return <div>Error loading products</div>;
  // Render the table
  return (
    <div className="pt-10">
      <div className="flex">
        <div className="p-10">
          <h3>Filter globally:</h3>
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="text-black"
            onFocus={handleGlobalFilterFocus}
          />
        </div>
        <div className="p-10">
          <h3>Filter category:</h3>

          <input
            name="search"
            value={searchTermCategory}
            placeholder="Search category"
            //onChange={handleChangeCategory}
            onChange={(e) => setSearchTermCategory(e.target.value)}
            className="text-black"
            onFocus={handleCategoryFocus}
          />
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
                      <div onClick={header.column.getToggleSortingHandler()}>
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
          className="border rounded px-4 py-2 cursor-pointer hover:bg-slate-500"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded px-4 py-2 cursor-pointer hover:bg-slate-500"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded px-4 py-2 cursor-pointer hover:bg-slate-500"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded px-4 py-2 cursor-pointer hover:bg-slate-500"
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
          className="border rounded px-4 py-2 cursor-pointer hover:bg-slate-500"
          type="button"
          onClick={() => exportExcel(table.getFilteredRowModel().rows)}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
