// Regional pricing configuration
// GBP prices from spreadsheet, converted to local currencies

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
  prices: Record<string, number>;
}

// Helper: round to 2 decimal places
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// GBP → EUR rate: 1.17
// GBP → USD rate: 1.34 (used for Sheet 2 USD prices)
// USD → CAD rate: 1.36
// USD → AUD rate: 1.53

export const REGIONAL_PRICING: Record<Region, RegionConfig> = {
  UK: {
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    prices: {
      A5: 9.98,
      A4: 10.98,
      A3: 14.98,
      A2: 17.98,
      A1: 22.98,
      A0: 31.98,
    },
  },
  DE: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    // GBP prices: A5=15.98, A4=12.98, A3=16.98, A2=17.98, A1=22.98, A0=45.98
    // Converted GBP × 1.17
    prices: {
      A5: r2(15.98 * 1.17),
      A4: r2(12.98 * 1.17),
      A3: r2(16.98 * 1.17),
      A2: r2(17.98 * 1.17),
      A1: r2(22.98 * 1.17),
      A0: r2(45.98 * 1.17),
    },
  },
  FR_ES: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'fr-FR',
    // GBP prices: A5=16.98, A4=17.98, A3=19.98, A2=22.98, A1=28.98, A0=45.98
    // Converted GBP × 1.17
    prices: {
      A5: r2(16.98 * 1.17),
      A4: r2(17.98 * 1.17),
      A3: r2(19.98 * 1.17),
      A2: r2(22.98 * 1.17),
      A1: r2(28.98 * 1.17),
      A0: r2(45.98 * 1.17),
    },
  },
  EU_WEST: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    // GBP prices: A5=17.98, A4=18.98, A3=19.98, A2=22.98, A1=28.98, A0=43.98
    // Converted GBP × 1.17
    prices: {
      A5: r2(17.98 * 1.17),
      A4: r2(18.98 * 1.17),
      A3: r2(19.98 * 1.17),
      A2: r2(22.98 * 1.17),
      A1: r2(28.98 * 1.17),
      A0: r2(43.98 * 1.17),
    },
  },
  EU_EAST: {
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    // GBP prices: A5=18.98, A4=21.98, A3=22.98, A2=27.98, A1=35.98, A0=49.98
    // Converted GBP × 1.17
    prices: {
      A5: r2(18.98 * 1.17),
      A4: r2(21.98 * 1.17),
      A3: r2(22.98 * 1.17),
      A2: r2(27.98 * 1.17),
      A1: r2(35.98 * 1.17),
      A0: r2(49.98 * 1.17),
    },
  },
  US: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    // USD prices from Sheet 2 (GBP × 1.34)
    prices: {
      A5: 15.98,
      A4: 16.98,
      A3: 17.98,
      A2: 19.98,
      A1: 27.98,
      A0: 59.98,
    },
  },
  CA: {
    currency: 'CAD',
    currencySymbol: 'C$',
    locale: 'en-CA',
    // USD prices for Canada row (GBP × 1.34): A5=26.77, A4=29.45, A3=32.13, A2=37.49, A1=48.21, A0=72.31
    // Then USD × 1.36 for CAD
    prices: {
      A5: r2(r2(19.98 * 1.34) * 1.36),
      A4: r2(r2(21.98 * 1.34) * 1.36),
      A3: r2(r2(23.98 * 1.34) * 1.36),
      A2: r2(r2(27.98 * 1.34) * 1.36),
      A1: r2(r2(35.98 * 1.34) * 1.36),
      A0: r2(r2(53.98 * 1.34) * 1.36),
    },
  },
  AU: {
    currency: 'AUD',
    currencySymbol: 'A$',
    locale: 'en-AU',
    // USD prices for Australia row (GBP × 1.34): A5=24.09, A4=24.09, A3=26.77, A2=30.79, A1=36.15, A0=45.53
    // Then USD × 1.53 for AUD
    prices: {
      A5: r2(r2(17.98 * 1.34) * 1.53),
      A4: r2(r2(17.98 * 1.34) * 1.53),
      A3: r2(r2(19.98 * 1.34) * 1.53),
      A2: r2(r2(22.98 * 1.34) * 1.53),
      A1: r2(r2(26.98 * 1.34) * 1.53),
      A0: r2(r2(33.98 * 1.34) * 1.53),
    },
  },
  WORLD: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    // USD prices from Sheet 2 for World/fallback row (same GBP as UK)
    prices: {
      A5: 13.37,
      A4: 14.71,
      A3: 20.07,
      A2: 24.09,
      A1: 30.79,
      A0: 42.85,
    },
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

export function getRegionalPrice(region: Region, size: string): number {
  const config = REGIONAL_PRICING[region];
  return config.prices[size] ?? 0;
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

export function getRegionalShipping(region: Region): number {
  const shipping: Record<Region, number> = {
    UK: 5.99,
    DE: 6.99,
    FR_ES: 6.99,
    EU_WEST: 6.99,
    EU_EAST: 6.99,
    US: 7.99,
    CA: 10.99,
    AU: 11.99,
    WORLD: 7.99,
  };
  return shipping[region];
}

export function getRegionalFreeShippingThreshold(region: Region): number {
  const thresholds: Record<Region, number> = {
    UK: 170,
    DE: 199,
    FR_ES: 199,
    EU_WEST: 199,
    EU_EAST: 199,
    US: 199,
    CA: 249,
    AU: 299,
    WORLD: 199,
  };
  return thresholds[region];
}
