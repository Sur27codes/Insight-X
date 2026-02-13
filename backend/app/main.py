from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.core.config import get_settings
from app.api.api import router as api_router
from app.services.scheduler import start_scheduler
import redis.asyncio as redis
import json
import asyncio

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for PubSub
redis_client = None

@app.on_event("startup")
async def startup_event():
    global redis_client
    
    # Ensure Tables Exist
    from app.db.models import Base
    from app.db.session import engine
    Base.metadata.create_all(bind=engine)
    
    redis_client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    start_scheduler()
    logger.info(f"🚀 InsightX Backend Started with Prompt: {settings.USER_PROMPT}")

@app.on_event("shutdown")
async def shutdown_event():
    if redis_client:
        await redis_client.close()

# Router
app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}

# WebSocket for Real-time Updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Subscribe to global events or specific run
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("insightx:events")
    
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_text(message["data"])
            else:
                await asyncio.sleep(0.1)  # Prevent busy loop
    except WebSocketDisconnect:
        await pubsub.close()
