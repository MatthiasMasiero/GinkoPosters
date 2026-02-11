"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/lib/types";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    api.admin.orders
      .get(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleStatusUpdate(newStatus: string) {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await api.admin.orders.updateStatus(order.id, newStatus);
      setOrder(updated);
    } catch {
      // Status update failed
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Order not found.
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/admin/orders")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Separator className="my-6" />

      {/* Status update */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Update Status:</span>
        <Select
          value={order.status}
          onValueChange={handleStatusUpdate}
          disabled={updating}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-6" />

      {/* Customer info */}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider">
            Customer
          </h2>
          <p className="text-sm">{order.customer_name}</p>
          <p className="text-sm text-muted-foreground">
            {order.customer_email}
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider">
            Shipping Address
          </h2>
          <p className="text-sm">{order.shipping_address_line1}</p>
          {order.shipping_address_line2 && (
            <p className="text-sm">{order.shipping_address_line2}</p>
          )}
          <p className="text-sm">
            {order.shipping_city}
            {order.shipping_state ? `, ${order.shipping_state}` : ""}{" "}
            {order.shipping_postal_code}
          </p>
          <p className="text-sm">{order.shipping_country}</p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Line items */}
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider">
        Items
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product_title}</TableCell>
              <TableCell>{item.variant_label}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatCurrency(item.unit_price)}</TableCell>
              <TableCell>{formatCurrency(item.total_price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator className="my-6" />

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(order.shipping_cost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
