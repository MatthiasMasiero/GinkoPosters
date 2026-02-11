"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { OrderTable } from "@/components/admin/order-table";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";

export default function AdminExportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    api.admin.orders
      .list({ status: "paid" })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  }

  async function handleMarkSent() {
    if (selectedIds.size === 0) return;
    setMarking(true);
    try {
      await api.admin.export.markSent(Array.from(selectedIds));
      // Refresh orders
      const updated = await api.admin.orders.list({ status: "paid" });
      setOrders(updated);
      setSelectedIds(new Set());
    } catch {
      // Failed to mark
    } finally {
      setMarking(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">
        Export for Fulfillment
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Orders with &quot;paid&quot; status ready to be sent to the printer.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={selectAll}>
          {selectedIds.size === orders.length && orders.length > 0
            ? "Deselect All"
            : "Select All"}
        </Button>
        <CsvExportButton orderIds={Array.from(selectedIds)} />
        <Button
          variant="outline"
          onClick={handleMarkSent}
          disabled={selectedIds.size === 0 || marking}
        >
          {marking ? "Marking..." : "Mark as Sent to Printer"}
        </Button>
        {selectedIds.size > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : (
          <OrderTable
            orders={orders}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
        )}
      </div>
    </div>
  );
}
