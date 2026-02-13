
import yfinance as yf
import pandas as pd
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

async def get_stock_data(ticker: str, period: str = "1y") -> Dict[str, Any]:
    """
    Fetches stock data for a given ticker.
    Args:
        ticker: The stock symbol (e.g., TSLA).
        period: The period to fetch (e.g., 1d, 5d, 1mo, 1y).
    Returns:
        Dict containing the ticker metadata and a list of prices.
    """
    try:
        logger.info(f"Fetching stock data for {ticker} over {period}")
        stock = yf.Ticker(ticker)
        # Fetch history
        hist = stock.history(period=period)
        
        if hist.empty:
            logger.warning(f"No data found for {ticker}")
            return {"error": "No data found", "ticker": ticker.upper()}

        # Reset index to get Date as a column
        hist.reset_index(inplace=True)
        
        # Helper for JSON safety
        def sanitize(val):
            import math
            import numpy as np
            if val is None: return None
            if isinstance(val, (float, int)):
                if np.isnan(val) or np.isinf(val):
                    return None
            return val

        # Format for frontend (Recharts expects 'date', 'value')
        data = []
        for _, row in hist.iterrows():
            # Handle different date formats (some have time, some don't)
            date_str = row['Date'].strftime('%Y-%m-%d')
            val = sanitize(row['Close'])
            if val is not None: val = round(val, 2)
            
            data.append({
                "date": date_str,
                "value": val,
                "volume": sanitize(row['Volume'])
            })

        info = stock.info
        
        current = sanitize(hist['Close'].iloc[-1])
        start = sanitize(hist['Close'].iloc[0])
        change_pct = 0
        if current is not None and start is not None and start != 0:
            change_pct = ((current - start) / start) * 100
        
        meta = {
            "name": info.get("longName", ticker.upper()),
            "currency": info.get("currency", "USD"),
            "sector": info.get("sector", "Unknown"),
            "current_price": round(current, 2) if current else 0,
            "change_pct": round(sanitize(change_pct), 2) if sanitize(change_pct) else 0
        }

        return {
            "ticker": ticker.upper(),
            "meta": meta,
            "data": data
        }

    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return {"error": str(e)}
