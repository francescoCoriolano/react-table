"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductsByCategory, Product } from "@/api/getData";
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
} from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
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
  // Custom hook to fetch products using react-query
  function useProducts() {
    return useQuery<Product[]>({
      queryKey: ["products"],
      queryFn: fetchProducts,
      //queryFn: fetchProducts,
    });
  }

  // Fetch products data
  const { data, error, isLoading, refetch } = useProducts();
  console.log("dataaaa", data);

  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, []);
  {
    /* ++++++++++++++++++++++++++++++++++++++ */
  }
  // Custom filter by Category

  const [searchTermCategory, setSearchTermCategory] = useState("beauty");
  const [resultsCategory, setResultsCategory] = useState<Product[]>([]);
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);
  const debouncedSearchTermCategory = useDebounce(searchTermCategory, 300);

  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermCategory(e.target.value);
  };

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

  useEffect(() => {
    const searchC = async () => {
      let results: Product[] = [];
      setIsSearchingCategory(true);
      if (debouncedSearchTermCategory) {
        const dataCategory = await fetchProductsByCategory({
          queryKey: ["category", debouncedSearchTermCategory],
        });
        results = dataCategory || [];
      }
      setIsSearchingCategory(false);
      setResultsCategory(results);
      console.log("resultsss", results);
    };
    searchC();
  }, [debouncedSearchTermCategory]);
  {
    /* ++++++++++++++++++++++++++++++++++++++ */
  }
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
    debugTable: true,
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

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    filename: "sample",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  // export function DOWNLOAD
  const exportExcel = (rows: Row<Product>[]) => {
    const rowData = rows.map((row) => {
      console.log("rows", rows);
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
      <div className="flex">
        <div className="p-10">
          <h3>Filter globally:</h3>
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="text-black"
          />
        </div>
        {/* ++++++++++++++++++++++++++++++++++++++ */}
        <div className="p-10">
          <h3>Filter category:</h3>
          <form onSubmit={handleSubmit}>
            <input
              name="search"
              placeholder="Search category"
              onChange={handleChangeCategory}
              className="text-black"
            />
            <button
              className="primary"
              disabled={isSearchingCategory}
              type="submit"
            >
              {isSearchingCategory ? "..." : "Search"}
            </button>
          </form>
        </div>
        {/* ++++++++++++++++++++++++++++++++++++++ */}
      </div>
      <div className="overflow-x-auto w-[80vw]">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      <div
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
              {table.getRowModel().rows.map((row) => (
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
              ))}
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

export default TableComponent;
