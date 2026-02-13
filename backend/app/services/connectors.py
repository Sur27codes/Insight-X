import logging
import asyncio
import random
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BaseConnector(ABC):
    @abstractmethod
    async def fetch_data(self):
        pass

class StripeMockConnector(BaseConnector):
    async def fetch_data(self):
        logger.info("Fetching data from Stripe (Mock)...")
        await asyncio.sleep(1)
        # Mocking revenue data
        return [{"date": "2024-01-01", "revenue": 1000}, {"date": "2024-01-02", "revenue": 1200}]

class ShopifyMockConnector(BaseConnector):
    async def fetch_data(self):
        logger.info("Fetching data from Shopify (Mock)...")
        await asyncio.sleep(1)
        return [{"date": "2024-01-01", "orders": 50}, {"date": "2024-01-02", "orders": 60}]

class GoogleAnalyticsMockConnector(BaseConnector):
    async def fetch_data(self):
        logger.info("Fetching data from Google Analytics (Mock)...")
        await asyncio.sleep(1)
        return [{"date": "2024-01-01", "sessions": 500}, {"date": "2024-01-02", "sessions": 600}]
