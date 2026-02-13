
from fastapi import APIRouter, HTTPException, Query
from app.services.stocks import get_stock_data

router = APIRouter()

@router.get("/{ticker}")
async def get_stock(ticker: str, period: str = Query("1y", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|max)$")):
    """
    Get real-time stock data for a ticker.
    """
    result = await get_stock_data(ticker, period)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
