export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "sent_to_printer", label: "Sent to Printer" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export const POSTER_SIZES = [
  { label: "A4", width_cm: 21, height_cm: 29.7 },
  { label: "A3", width_cm: 29.7, height_cm: 42 },
  { label: "A2", width_cm: 42, height_cm: 59.4 },
  { label: "A1", width_cm: 59.4, height_cm: 84.1 },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  sent_to_printer: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const SHIPPING_COST = 5.99;
