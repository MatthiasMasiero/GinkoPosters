"use client";

import type { AccountingSummary as AccountingSummaryType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AccountingSummaryProps {
  summary: AccountingSummaryType;
}

export function AccountingSummaryView({ summary }: AccountingSummaryProps) {
  return (
    <div>
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.total_revenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total COGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.total_cogs)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.total_stripe_fees)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.total_platform_profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-artist breakdown */}
      {summary.per_artist.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">
            Per-Artist Breakdown
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>COGS</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Artist Payout</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.per_artist.map((row) => (
                <TableRow key={row.artist_id}>
                  <TableCell className="font-medium">
                    {row.artist_name}
                  </TableCell>
                  <TableCell>{row.order_count}</TableCell>
                  <TableCell>{formatCurrency(row.revenue)}</TableCell>
                  <TableCell>{formatCurrency(row.cogs)}</TableCell>
                  <TableCell>{formatCurrency(row.stripe_fees)}</TableCell>
                  <TableCell>{formatCurrency(row.artist_payout)}</TableCell>
                  <TableCell>{formatCurrency(row.platform_profit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
