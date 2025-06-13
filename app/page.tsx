import ProductList from "@/components/ProductsList";

// Define the Product type (matching your Drizzle schema)
interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Define the API response type
interface ApiResponse {
  success: boolean;
  message: string;
  data: Product[];
}

// Fetch products from your Hono API
async function fetchProducts(): Promise<ApiResponse> {
  try {
    const response = await fetch("https://hono-static-edge-server.aplance.workers.dev/get-products", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      message: "Failed to fetch products",
      data: [],
    };
  }
}

export default async function Page() {
  const apiResponse = await fetchProducts();

  return (
    <ProductList
      message={apiResponse.message}
      buildTime={new Date().toISOString()}
      products={apiResponse.data}
    />
  );
}
