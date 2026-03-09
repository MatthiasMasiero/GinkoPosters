import logging

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

_PLACEHOLDER_SECRETS = {
    "change-this-in-production-use-a-long-random-string",
    "sk_test_placeholder",
    "whsec_placeholder",
    "re_placeholder",
}


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ginko:ginko_dev@localhost:5432/ginkoposters"
    DATABASE_URL_SYNC: str = "postgresql://ginko:ginko_dev@localhost:5432/ginkoposters"

    # Stripe
    STRIPE_SECRET_KEY: str = "sk_test_placeholder"
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_placeholder"
    STRIPE_WEBHOOK_SECRET: str = "whsec_placeholder"

    # JWT
    JWT_SECRET_KEY: str = "change-this-in-production-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 4

    # AWS S3
    AWS_ACCESS_KEY_ID: str = "your-access-key"
    AWS_SECRET_ACCESS_KEY: str = "your-secret-key"
    AWS_DEFAULT_REGION: str = "eu-central-1"
    S3_BUCKET_NAME: str = "ginkoposters-print-files"

    # Resend (email)
    RESEND_API_KEY: str = "re_placeholder"
    FROM_EMAIL: str = "Ginko Posters <noreply@ginkoposters.com>"

    # Shipping
    SHIPPING_COST_EUR: float = 5.99

    # Discount
    MULTI_ITEM_DISCOUNT_RATE: float = 0.15

    # App
    PRIMARY_DOMAIN: str = "localhost"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env", "extra": "ignore"}

    def validate_secrets(self) -> None:
        """Validate that placeholder secrets are not used in production."""
        if self.ENVIRONMENT == "production":
            errors = []
            if self.JWT_SECRET_KEY in _PLACEHOLDER_SECRETS:
                errors.append("JWT_SECRET_KEY is still a placeholder")
            if self.STRIPE_SECRET_KEY in _PLACEHOLDER_SECRETS:
                errors.append("STRIPE_SECRET_KEY is still a placeholder")
            if self.STRIPE_WEBHOOK_SECRET in _PLACEHOLDER_SECRETS:
                errors.append("STRIPE_WEBHOOK_SECRET is still a placeholder")
            if self.RESEND_API_KEY in _PLACEHOLDER_SECRETS:
                errors.append("RESEND_API_KEY is still a placeholder")
            if len(self.JWT_SECRET_KEY) < 32:
                errors.append("JWT_SECRET_KEY must be at least 32 characters")
            if errors:
                raise ValueError(
                    f"Invalid production configuration: {'; '.join(errors)}"
                )
        else:
            if self.JWT_SECRET_KEY in _PLACEHOLDER_SECRETS:
                logger.warning(
                    "JWT_SECRET_KEY is using a placeholder value — do not use in production"
                )
            if self.STRIPE_SECRET_KEY in _PLACEHOLDER_SECRETS:
                logger.warning(
                    "STRIPE_SECRET_KEY is using a placeholder value — do not use in production"
                )
            if self.RESEND_API_KEY in _PLACEHOLDER_SECRETS:
                logger.warning(
                    "RESEND_API_KEY is using a placeholder value — emails will not be sent"
                )


settings = Settings()
