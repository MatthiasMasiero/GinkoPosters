"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";
import { useArtist } from "@/hooks/use-artist";
import { api } from "@/lib/api-client";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.string().email("Valid email is required"),
  shipping_address_line1: z.string().min(3, "Address is required"),
  shipping_address_line2: z.string().optional(),
  shipping_city: z.string().min(2, "City is required"),
  shipping_state: z.string().optional(),
  shipping_postal_code: z.string().min(3, "Postal code is required"),
  shipping_country: z.string().min(2, "Country is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { artist } = useArtist();
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const result = checkoutSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CheckoutFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const orderData = {
        artist_id: artist?.id || "",
        ...result.data,
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.orders.create(orderData);

      if (response.stripe_checkout_url) {
        clearCart();
        window.location.href = response.stripe_checkout_url;
      } else {
        clearCart();
        router.push(`/storefront/order-confirmation?order_id=${response.id}`);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create order"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fields: {
    name: keyof CheckoutFormData;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
  }[] = [
    { name: "customer_name", label: "Full Name", placeholder: "John Doe", required: true },
    { name: "customer_email", label: "Email", placeholder: "john@example.com", type: "email", required: true },
    { name: "shipping_address_line1", label: "Address Line 1", placeholder: "123 Main St", required: true },
    { name: "shipping_address_line2", label: "Address Line 2", placeholder: "Apt 4B" },
    { name: "shipping_city", label: "City", placeholder: "Berlin", required: true },
    { name: "shipping_state", label: "State / Province", placeholder: "Berlin" },
    { name: "shipping_postal_code", label: "Postal Code", placeholder: "10115", required: true },
    { name: "shipping_country", label: "Country", placeholder: "Germany", required: true },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name} className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </Label>
          <Input
            id={field.name}
            name={field.name}
            type={field.type || "text"}
            placeholder={field.placeholder}
            className="mt-1"
          />
          {errors[field.name] && (
            <p className="mt-1 text-xs text-destructive">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <Button
        type="submit"
        disabled={submitting || items.length === 0}
        className="w-full"
      >
        {submitting ? "Processing..." : "Pay with Stripe"}
      </Button>
    </form>
  );
}
