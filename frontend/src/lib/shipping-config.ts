// Shipping policy: which regions get free shipping vs the flat fee.
//
// Source of truth — edit this file to change shipping behavior.
// Mirrored on the backend in `backend/src/payments/shipping_config.py`;
// keep the two in sync.

import type { Region } from "./regional-pricing";

// Regions in this list ALWAYS get free shipping. Any region NOT in this
// list (today: only WORLD) pays the flat fee in their local currency.
export const FREE_SHIPPING_REGIONS: readonly Region[] = [
  "UK",
  "DE",
  "FR_ES",
  "EU_WEST",
  "EU_EAST",
  "US",
  "CA",
  "AU",
];

// Flat shipping fee for non-free regions, in each region's local currency.
export const FLAT_SHIPPING_FEE = 8;

export function isFreeShippingRegion(region: Region): boolean {
  return FREE_SHIPPING_REGIONS.includes(region);
}

export function getShippingFee(region: Region): number {
  return isFreeShippingRegion(region) ? 0 : FLAT_SHIPPING_FEE;
}
