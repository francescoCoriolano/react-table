import React from "react";
import TableOne from "./TableOne";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("<TableOne />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <TableOne />
      </QueryClientProvider>
    );
  });
});
