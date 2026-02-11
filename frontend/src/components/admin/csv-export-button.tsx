"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

interface CsvExportButtonProps {
  orderIds: string[];
  disabled?: boolean;
}

export function CsvExportButton({ orderIds, disabled }: CsvExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (orderIds.length === 0) return;
    setExporting(true);

    try {
      const blob = await api.admin.export.csv(orderIds);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `print-shrimp-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Export failed
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || orderIds.length === 0 || exporting}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {exporting ? "Exporting..." : "Export CSV for Print Shrimp"}
    </Button>
  );
}
