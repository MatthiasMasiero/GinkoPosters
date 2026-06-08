// Regional pricing configuration
// Prices are stored in the database (EUR) and converted to local currencies
// using the rates below. Admin dashboard controls the base EUR price.

export type Region =
  | 'UK'
  | 'DE'
  | 'FR_ES'
  | 'EU_WEST'
  | 'EU_EAST'
  | 'US'
  | 'CA'
  | 'AU'
  | 'WORLD';

export interface RegionConfig {
  currency: string;
  currencySymbol: string;
  locale: string;
  /** Multiplier to convert from EUR (DB price) to this region's currency */
  conversionRate: number;
}

// Helper: round to 2 decimal places
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Conversion rates FROM EUR (the DB/Stripe currency)
// EUR → GBP: 0.855 (1/1.17)
// EUR → USD: 1.145 (1.34/1.17)
// EUR → CAD: 1.557 (USD × 1.36)
// EUR → AUD: 1.752 (USD × 1.53)

export const REGIONAL_PRICING: Record<Region, RegionConfig> = {
  UK: {
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    conversionRate: 0.855, // EUR → GBP
  },
  DE: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    conversionRate: 1.0, // already EUR
  },
  FR_ES: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'fr-FR',
    conversionRate: 1.0,
  },
  EU_WEST: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    conversionRate: 1.0,
  },
  EU_EAST: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    conversionRate: 1.0,
  },
  US: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    conversionRate: 1.145, // EUR → USD
  },
  CA: {
    currency: 'CAD',
    currencySymbol: 'C$',
    locale: 'en-CA',
    conversionRate: 1.557, // EUR → CAD
  },
  AU: {
    currency: 'AUD',
    currencySymbol: 'A$',
    locale: 'en-AU',
    conversionRate: 1.752, // EUR → AUD
  },
  WORLD: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    conversionRate: 1.145, // EUR → USD (same as US)
  },
} as const;

export const COUNTRY_TO_REGION: Record<string, Region> = {
  // UK
  GB: 'UK',

  // Germany
  DE: 'DE',

  // France & Spain
  FR: 'FR_ES',
  ES: 'FR_ES',

  // EU West: Italy, Belgium, Austria, Netherlands, Sweden, Denmark, Finland, Luxembourg
  IT: 'EU_WEST',
  BE: 'EU_WEST',
  AT: 'EU_WEST',
  NL: 'EU_WEST',
  SE: 'EU_WEST',
  DK: 'EU_WEST',
  FI: 'EU_WEST',
  LU: 'EU_WEST',

  // EU East: Czech, Poland, Greece, Portugal, Ireland, Romania, Bulgaria, Croatia,
  // Slovakia, Slovenia, Hungary, Estonia, Latvia, Lithuania
  CZ: 'EU_EAST',
  PL: 'EU_EAST',
  GR: 'EU_EAST',
  PT: 'EU_EAST',
  IE: 'EU_EAST',
  RO: 'EU_EAST',
  BG: 'EU_EAST',
  HR: 'EU_EAST',
  SK: 'EU_EAST',
  SI: 'EU_EAST',
  HU: 'EU_EAST',
  EE: 'EU_EAST',
  LV: 'EU_EAST',
  LT: 'EU_EAST',

  // USA
  US: 'US',

  // Canada
  CA: 'CA',

  // Australia
  AU: 'AU',
};

export function getRegionFromCountry(countryCode: string): Region {
  return COUNTRY_TO_REGION[countryCode.toUpperCase()] ?? 'WORLD';
}

/**
 * Convert a base EUR price (from the database) to the regional currency.
 * This is the single source of truth for display prices — admin sets
 * variant.price in the dashboard, and this function converts it.
 */
export function convertToRegionalPrice(eurPrice: number, region: Region): number {
  const config = REGIONAL_PRICING[region];
  return r2(eurPrice * config.conversionRate);
}

export function formatRegionalCurrency(amount: number, region: Region): string {
  const config = REGIONAL_PRICING[region];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getRegionConfig(region: Region): RegionConfig {
  return REGIONAL_PRICING[region];
}

// Imperial size labels for display purposes.
// Imperial sizes are stored as separate variants (e.g. "12x18") with their own SKUs.
// A-series sizes are shown as-is (e.g. "A4", "A1").
export const IMPERIAL_SIZE_LABELS: Record<string, string> = {
  '12x18': '12×18″',
  '16x24': '16×24″',
  '20x30': '20×30″',
  '24x36': '24×36″',
};

// Which sizes belong to which region type
export const METRIC_SIZES = ['A5', 'A4', 'A3', 'A2', 'A1', 'A0'];
export const IMPERIAL_SIZES = ['12x18', '16x24', '20x30', '24x36'];

export function isImperialSize(size: string): boolean {
  return IMPERIAL_SIZES.includes(size);
}

export function isMetricSize(size: string): boolean {
  return METRIC_SIZES.includes(size);
}

export function getDisplaySize(size: string, region: Region): string {
  if (isImperialSize(size)) return IMPERIAL_SIZE_LABELS[size] ?? size;
  return size;
}

/**
 * Filter variants to show only the appropriate sizes for the region.
 * US/CA/AU see imperial sizes, everyone else sees A-series.
 */
export function getRegionSizes(region: Region): 'imperial' | 'metric' {
  if (region === 'US' || region === 'CA' || region === 'AU') return 'imperial';
  return 'metric';
}
