"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    api.orders
      .getStatus(orderId)
      .then((data) => {
        setOrderNumber(data.order_number);
        setStatus(data.status);
      })
      .catch(() => {
        // Order not found
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!orderId || !orderNumber) {
    return (
      <div className="px-6 py-24 text-center md:px-12">
        <p className="text-muted-foreground">Order not found.</p>
        <Link href="/storefront" className="mt-4 inline-block text-sm underline">
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-24 text-center md:px-12">
      <CheckCircle2 className="h-16 w-16 text-green-600" />
      <h1 className="mt-6 text-3xl font-light tracking-tight">Thank You!</h1>
      <p className="mt-4 text-muted-foreground">
        Your order has been placed successfully.
      </p>
      <div className="mt-8 rounded-lg border px-8 py-6">
        <p className="text-sm text-muted-foreground">Order Number</p>
        <p className="mt-1 text-lg font-medium">{orderNumber}</p>
        <p className="mt-4 text-sm text-muted-foreground">Status</p>
        <p className="mt-1 text-sm font-medium capitalize">{status}</p>
      </div>
      <Link href="/storefront" className="mt-10">
        <Button variant="outline">Back to Store</Button>
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
