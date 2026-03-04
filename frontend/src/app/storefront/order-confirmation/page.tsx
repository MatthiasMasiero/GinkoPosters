"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { Button } from "@/components/ui/button";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const artistSlug = searchParams.get("artist");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const storeHref = artistSlug
    ? `/storefront?artist=${artistSlug}`
    : "/storefront";

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
        <div className="line-loader mx-auto w-24 text-foreground" />
      </div>
    );
  }

  if (!orderId || !orderNumber) {
    return (
      <div className="px-6 py-24 text-center md:px-12">
        <p className="text-muted-foreground">Order not found.</p>
        <Link
          href={storeHref}
          className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.08em] underline transition-colors duration-200 hover:text-foreground"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-col items-center px-6 py-24 text-center md:px-12">
      <FadeIn duration={500}>
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </FadeIn>
      <FadeIn delay={200}>
        <h1 className="mt-6 text-3xl font-extrabold uppercase tracking-tight">
          Thank You!
        </h1>
      </FadeIn>
      <FadeIn delay={350}>
        <p className="mt-4 text-muted-foreground">
          Your order has been placed successfully.
        </p>
      </FadeIn>
      <FadeIn delay={500}>
        <div className="mt-8 border px-8 py-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
            Order Number
          </p>
          <p className="mt-1 text-lg font-bold">{orderNumber}</p>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
            Status
          </p>
          <p className="mt-1 text-sm font-bold capitalize">{status}</p>
        </div>
      </FadeIn>
      <FadeIn delay={650}>
        <Link href={storeHref} className="mt-10">
          <Button variant="outline" className="text-xs font-extrabold uppercase tracking-[0.08em]">
            Back to Store
          </Button>
        </Link>
      </FadeIn>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="line-loader mx-auto w-24 text-foreground" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
