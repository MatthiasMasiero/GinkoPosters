"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { AccountingSummaryView } from "@/components/admin/accounting-summary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AccountingSummary } from "@/lib/types";

export default function AdminAccountingPage() {
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function fetchSummary(start?: string, end?: string) {
    setLoading(true);
    api.admin.accounting
      .summary(start, end)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  function handleFilter() {
    fetchSummary(startDate || undefined, endDate || undefined);
  }

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Accounting</h1>

      {/* Date range selector */}
      <div className="mt-6 flex items-end gap-4">
        <div>
          <Label htmlFor="start" className="text-sm">
            Start Date
          </Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="end" className="text-sm">
            End Date
          </Label>
          <Input
            id="end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleFilter}>Apply</Button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          </div>
        ) : summary ? (
          <AccountingSummaryView summary={summary} />
        ) : (
          <p className="text-muted-foreground">
            No accounting data available.
          </p>
        )}
      </div>
    </div>
  );
}
