from fastapi import Query


def pagination_params(
    limit: int = Query(default=50, ge=1, le=200, description="Number of items to return"),
    offset: int = Query(default=0, ge=0, description="Number of items to skip"),
) -> tuple[int, int]:
    """Common pagination dependency."""
    return limit, offset
