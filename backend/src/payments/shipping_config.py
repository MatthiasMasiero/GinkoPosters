"""Shipping policy: which countries get free shipping vs the flat fee.

Source of truth on the backend — mirrors `frontend/src/lib/shipping-config.ts`
and the country→region map in `frontend/src/lib/regional-pricing.ts`.
Keep these in sync.
"""

# Countries we explicitly ship to. Any country in this set gets FREE shipping.
# Any country NOT in this set (the fallback / WORLD region) pays FLAT_SHIPPING_FEE.
FREE_SHIPPING_COUNTRIES: frozenset[str] = frozenset({
    # UK
    "GB",
    # Germany
    "DE",
    # France & Spain
    "FR", "ES",
    # EU West
    "IT", "BE", "AT", "NL", "SE", "DK", "FI", "LU",
    # EU East
    "CZ", "PL", "GR", "PT", "IE", "RO", "BG", "HR",
    "SK", "SI", "HU", "EE", "LV", "LT",
    # USA
    "US",
    # Canada
    "CA",
    # Australia
    "AU",
})

# Flat shipping fee for non-free regions, charged in the Stripe session currency.
FLAT_SHIPPING_FEE: float = 8.0


def is_free_shipping_country(country_code: str | None) -> bool:
    if not country_code:
        return False
    return country_code.upper() in FREE_SHIPPING_COUNTRIES


def get_shipping_fee(country_code: str | None) -> float:
    return 0.0 if is_free_shipping_country(country_code) else FLAT_SHIPPING_FEE
