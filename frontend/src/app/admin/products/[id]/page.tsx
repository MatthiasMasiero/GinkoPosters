"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/lib/types";

export default function AdminProductEditPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.products
      .get(id)
      .then(setProduct)
      .catch(() => setProduct(undefined))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-light tracking-tight">
        Edit {product?.title || "Product"}
      </h1>
      <ProductForm product={product} />
    </div>
  );
}
