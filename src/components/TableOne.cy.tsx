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
            title: "Product A",
            category: "Category A",
            rating: 4.5,
            price: 100,
          },
          {
            id: 2,
            brand: "Brand B",
            title: "Product B",
            category: "Category B",
            rating: 4.0,
            price: 200,
          },
          {
            id: 2,
            brand: "Essence",
            title: "Essence",
            category: "Essence",
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
  });
  it("displays loading state", () => {
    cy.intercept("GET", "https://dummyjson.com/products", (req) => {
      req.reply((res) => {
        res.setDelay(1000);
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
  //   cy.intercept("GET", "/api/products", { statusCode: 500 }).as(
  //     "getProductsError"
  //   );

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
    cy.get("tbody tr").should("have.length", 1);
    cy.contains("Essence").should("be.visible");
  });
});
