import React from "react";
import TableOne from "./TableOne";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mount } from "cypress/react";

const queryClient = new QueryClient();

describe("<TableOne />", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://dummyjson.com/products", {
      statusCode: 200,
      body: {
        products: [
          {
            id: 1,
            brand: "Brand A",
            title: "A",
            // title: "Product A",
            category: "Beauty",
            rating: 4.5,
            price: 100,
          },
          {
            id: 2,
            brand: "Brand B",
            title: "B",
            // title: "Product B",
            category: "Fragrances",
            rating: 4.0,
            price: 200,
          },
          {
            id: 3,
            brand: "Essence",
            title: "C",
            //title: "Essence",
            category: "Furniture",
            rating: 4.0,
            price: 200,
          },
          {
            id: 4,
            brand: "Essence",
            // title: "Essence",
            title: "D",
            category: "Groceries",
            rating: 4.0,
            price: 200,
          },
        ],
      },
    }).as("getProducts");
  });

  it("Render Table into UI", () => {
    mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );
    cy.wait("@getProducts");
    cy.get("tbody tr").should("have.length", 4);
  });
  it("displays loading state", () => {
    cy.intercept("GET", "https://dummyjson.com/products", (req) => {
      req.reply((res) => {
        res.setDelay(2000);
        res.send({ products: [] });
      });
    }).as("getProductsDelayed");

    mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );

    cy.contains("Loading...").should("be.visible");
  });

  // it("displays error state", () => {
  //   cy.intercept("GET", "https://dummyjson.com/products", {
  //     statusCode: 500,
  //   }).as("getProductsError");

  //   mount(
  //     <QueryClientProvider client={queryClient}>
  //       <TableOne />
  //     </QueryClientProvider>
  //   );
  //   cy.wait("@getProductsError", { timeout: 7000 });
  //   cy.contains("Error loading products").should("be.visible");
  // });

  it("filters table using global filter (search box)", () => {
    mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );

    cy.wait("@getProducts");

    // Type in the global search box
    cy.get('input[placeholder="Search..."]').type("Essence");

    // Verify that only the matching row is displayed
    cy.contains("Essence").should("be.visible");
  });

  it("filters table using category filter dropdown", () => {
    mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );

    cy.wait("@getProducts");

    // Select a category from the dropdown
    cy.get('select[aria-label="Category"]').select("beauty");

    // Verify that only the matching rows are displayed
    cy.get("tbody tr").should("have.length", 1);
    cy.contains("beauty").should("be.visible");
  });
  it("filters table using combined global filter and category filter", () => {
    mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );

    cy.wait("@getProducts");

    // Type in the global search box
    cy.get('input[placeholder="Search..."]').type("Essence");
    cy.wait(4000);
    // Select a category from the dropdown
    cy.get('select[aria-label="Category"]').select("furniture");

    // Verify that only the matching row is displayed
    cy.get("tbody tr").should("have.length", 1);
    cy.contains("Essence").should("be.visible");
  });
  it("sorts table by column header", () => {
    mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );

    cy.wait("@getProducts");
    // Click on the "Title" column header again to sort in ascending order
    cy.contains("th", "Title").click();
    cy.get("tbody tr").first().contains("A");
    cy.get("tbody tr").last().contains("D");
    // Click on the "Title" column header to sort in descending order
    cy.contains("th", "Title").click();
    cy.get("tbody tr").first().contains("D");
    cy.get("tbody tr").last().contains("A");
    // Verify sorting resets when switching filters
    cy.get('select[aria-label="Category"]').select("beauty");
    cy.get("tbody tr").should("have.length", 1);
    cy.contains("beauty").should("be.visible");
  });
});
