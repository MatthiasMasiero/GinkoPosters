"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";
import { ShoppingCart, TrendingUp, Clock, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .dashboard()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Total Orders",
      value: stats ? String(stats.total_orders) : "--",
      icon: ShoppingCart,
    },
    {
      title: "Revenue Today",
      value: stats ? formatCurrency(stats.revenue_today) : "--",
      icon: TrendingUp,
    },
    {
      title: "Pending Orders",
      value: stats ? String(stats.pending_orders) : "--",
      icon: Clock,
    },
    {
      title: "Artists",
      value: stats ? String(stats.artists_count) : "--",
      icon: Users,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight">Dashboard</h1>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
