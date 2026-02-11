"use client";

import Link from "next/link";
import type { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderTableProps {
  orders: Order[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function OrderTable({
  orders,
  selectable = false,
  selectedIds,
  onToggleSelect,
}: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && <TableHead className="w-10" />}
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={selectable ? 6 : 5}
              className="py-8 text-center text-muted-foreground"
            >
              No orders found.
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              {selectable && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(order.id) || false}
                    onChange={() => onToggleSelect?.(order.id)}
                    className="rounded border-input"
                  />
                </TableCell>
              )}
              <TableCell>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium hover:underline"
                >
                  {order.order_number}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer_email}
                  </p>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(order.total)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
