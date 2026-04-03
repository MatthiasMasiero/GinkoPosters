"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductVariant } from "@/lib/types";
import { MULTI_ITEM_DISCOUNT_RATE } from "@/lib/constants";
import { getRegionFromCountry, getRegionalPrice } from "@/lib/regional-pricing";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  isItemDiscounted: (item: CartItem) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "ginko_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [country, setCountry] = useState("");

  useEffect(() => {
    setItems(loadCart());
    const cookies = document.cookie.split(";");
    const c = cookies.find((c) => c.trim().startsWith("user_country="));
    setCountry(c?.split("=")[1]?.trim() || "");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveCart(items);
    }
  }, [items, mounted]);

  const addItem = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.variant.id === variant.id);
        if (existing) {
          return prev.map((item) =>
            item.variant.id === variant.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, variant, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.variant.id !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Use regional pricing for calculations
  const region = getRegionFromCountry(country);

  const subtotal = items.reduce(
    (sum, item) => {
      const price = getRegionalPrice(region, item.variant.size);
      return sum + price * item.quantity;
    },
    0
  );

  // Group items by artist_id and apply 15% discount for artists with 2+ items
  const artistItemCounts = items.reduce<Record<string, number>>((acc, item) => {
    const artistId = item.product.artist_id;
    acc[artistId] = (acc[artistId] || 0) + item.quantity;
    return acc;
  }, {});

  const discountedArtists = new Set(
    Object.entries(artistItemCounts)
      .filter(([, count]) => count >= 2)
      .map(([artistId]) => artistId)
  );

  const discount = items.reduce((sum, item) => {
    if (discountedArtists.has(item.product.artist_id)) {
      const price = getRegionalPrice(region, item.variant.size);
      return sum + price * item.quantity * MULTI_ITEM_DISCOUNT_RATE;
    }
    return sum;
  }, 0);

  const discountedSubtotal = subtotal - discount;

  const isItemDiscounted = useCallback(
    (item: CartItem) => discountedArtists.has(item.product.artist_id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        discountedSubtotal,
        isItemDiscounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
