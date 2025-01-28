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
  const { data } = await axios.get("https://dummyjson.com/products");
  return data.products;
}
