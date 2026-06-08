"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  type Region,
  getRegionFromCountry,
  convertToRegionalPrice,
  formatRegionalCurrency,
  getRegionConfig,
  getDisplaySize,
  getRegionSizes,
  isImperialSize,
  isMetricSize,
} from "@/lib/regional-pricing";
import type { ProductVariant } from "@/lib/types";

interface RegionContextValue {
  region: Region;
  country: string;
  /** Convert a variant's EUR price to the regional display price */
  getPrice: (variantPrice: number) => number;
  formatPrice: (amount: number) => string;
  getSizeLabel: (size: string) => string;
  /** Filter variants to only those appropriate for this region */
  filterVariants: (variants: ProductVariant[]) => ProductVariant[];
  currencySymbol: string;
}

const RegionContext = createContext<RegionContextValue | null>(null);

function getCountryFromCookie(): string {
  if (typeof document === "undefined") return "";
  const cookies = document.cookie.split(";");
  const countryCookie = cookies.find((c) => c.trim().startsWith("user_country="));
  return countryCookie?.split("=")[1]?.trim() || "";
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState("");

  useEffect(() => {
    setCountry(getCountryFromCookie());
  }, []);

  const region = getRegionFromCountry(country);
  const config = getRegionConfig(region);
  const sizeType = getRegionSizes(region);

  const getPrice = (variantPrice: number) => convertToRegionalPrice(variantPrice, region);
  const formatPrice = (amount: number) => formatRegionalCurrency(amount, region);
  const getSizeLabel = (size: string) => getDisplaySize(size, region);

  const filterVariants = (variants: ProductVariant[]) => {
    const filterFn = sizeType === 'imperial' ? isImperialSize : isMetricSize;
    const filtered = variants.filter((v) => filterFn(v.size));
    // Fallback: if no variants match the region type, show all (handles
    // products that only have one size type set up)
    return filtered.length > 0 ? filtered : variants;
  };

  return (
    <RegionContext.Provider
      value={{
        region,
        country,
        getPrice,
        formatPrice,
        getSizeLabel,
        filterVariants,
        currencySymbol: config.currencySymbol,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
