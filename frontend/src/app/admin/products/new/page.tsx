"use client";

import { ProductForm } from "@/components/admin/product-form";

export default function AdminProductNewPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-light tracking-tight">
        Create Product
      </h1>
      <ProductForm />
    </div>
  );
}
