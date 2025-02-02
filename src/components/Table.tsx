"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  }),
  columnHelper.accessor("brand", {
    header: "Brand",
  }),
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor("category", {
    header: "Category",
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
  // State for category search term and results
  const [searchTermCategory, setSearchTermCategory] = useState("");
  const [resultsCategory, setResultsCategory] = useState<Product[]>([]);
  const debouncedSearchTermCategory = useDebounce(searchTermCategory, 300);

  // Fetch products data using react-query
  // const { data, error, isLoading, refetch } = useQuery<Product[]>({
  //   queryKey: ["products"],
  //   queryKey: ["category", debouncedSearchTermCategory],
  //   queryFn: fetchProducts,
  // });

  // Refetch data on component mount
  // useEffect(() => {
  //   refetch();
  // }, [refetch,debouncedSearchTermCategory]);

  // Fetch products by category when search term changes
  useEffect(() => {
    const searchC = async () => {
      const dataCategory = await fetchProductsByCategory({
        queryKey: ["category", debouncedSearchTermCategory],
      });
      setResultsCategory(dataCategory || []);
    };
    searchC();
  }, [debouncedSearchTermCategory]);
  // Handle category input change
  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermCategory(e.target.value);
  };

  // Handle form submit for category search
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");
    if (typeof searchValue === "string") {
      setSearchTermCategory(searchValue);
    }
    e.currentTarget.reset();
    e.currentTarget.focus();
  };

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // State for global filter
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Initialize the table with react-table
  const table = useReactTable({
    columns,
    data: resultsCategory ?? [],
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
  // Display loading state
  // if (isLoading) return <div>Loading...</div>;

  // // Display error state
  // if (error) return <div>Error loading products</div>;

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
          <form onSubmit={handleSubmit}>
            <input
              name="search"
              placeholder="Search category"
              onChange={handleChangeCategory}
              className="text-black"
              onFocus={handleCategoryFocus}
            />
          </form>
        </div>
      </div>
      <div className="overflow-x-auto w-[80vw]">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
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
              {resultsCategory.length === 0 ? (
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
