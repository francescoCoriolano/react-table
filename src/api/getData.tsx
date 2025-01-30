import axios from "axios";

export type Product = {
  id: number;
  brand: string;
  title: string;
  category: string;
  rating: number;
  price: number;
};

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await axios.get<{ products: Product[] }>(
      "https://dummyjson.com/products"
      // "https://dummyjson.com/products?limit=10&skip=0"
    );
    return response.data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}
