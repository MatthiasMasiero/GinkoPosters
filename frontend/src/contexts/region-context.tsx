"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  type Region,
  getRegionFromCountry,
  getRegionalPrice,
  formatRegionalCurrency,
  getRegionConfig,
} from "@/lib/regional-pricing";

interface RegionContextValue {
  region: Region;
  country: string;
  getPrice: (size: string) => number;
  formatPrice: (amount: number) => string;
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
  const country = getCountryFromCookie();
  const region = getRegionFromCountry(country);
  const config = getRegionConfig(region);

  const getPrice = (size: string) => getRegionalPrice(region, size);
  const formatPrice = (amount: number) => formatRegionalCurrency(amount, region);

  return (
    <RegionContext.Provider
      value={{
        region,
        country,
        getPrice,
        formatPrice,
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
