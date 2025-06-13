// components/ProductList.tsx
'use client';

import { useState, useEffect } from 'react';

// Define the Product type (matching your Drizzle schema)
interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Define the props type
interface ProductListProps {
  message: string;
  buildTime: string;
  products: Product[];
}

export default function ProductList({ message, buildTime, products }: ProductListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Next.js Auto-Deploy Demo</h1>

      <div style={{ padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Build Information</h2>
        <p>
          <strong>Message:</strong> {message}
        </p>
        <p>
          <strong>Built at:</strong> {buildTime}
        </p>
        <p>
          <strong>Current time:</strong> {new Date().toLocaleString()}
        </p>
      </div>

      <div>
        <h2>Products</h2>
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                margin: '10px 0',
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              <h3>{product.name}</h3>
              <p>
                <strong>Price:</strong> ${product.price}
              </p>
              <p>
                <strong>Created At:</strong> {new Date(product.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Updated At:</strong> {new Date(product.updatedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div style={{padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>How to trigger rebuild:</h3>
        <ol>
          <li>Use Postman to send POST request to your Hono.js endpoint (/trigger-deploy)</li>
          <li>Hono.js will trigger GitHub Action</li>
          <li>GitHub Action will rebuild and deploy this site</li>
          <li>Refresh this page to see the new build time and updated products</li>
        </ol>
      </div>
    </div>
  );
}