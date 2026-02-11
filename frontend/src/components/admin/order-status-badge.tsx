import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  const label = status.replace(/_/g, " ");

  return (
    <Badge variant="secondary" className={colorClass}>
      <span className="capitalize">{label}</span>
    </Badge>
  );
}
