from fastapi import APIRouter
from app.api.endpoints import datasets, runs, tools, stocks

router = APIRouter()

router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
router.include_router(runs.router, prefix="/runs", tags=["runs"])
router.include_router(tools.router, prefix="/tools", tags=["tools"])
router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
