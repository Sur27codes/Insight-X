from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services import forecasting
from app.db.session import get_db
from app.db import models

router = APIRouter()

class RunCreate(BaseModel):
    dataset_id: int
    horizon: int = 30
    model_type: str = "prophet"
    overrides: dict = None

@router.post("/start")
async def start_run(run: RunCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Create DB entry
    db_run = models.ForecastRun(
        dataset_id=run.dataset_id,
        horizon=run.horizon,
        model_type=run.model_type,
        status="running",
        parameters=run.overrides
    )
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    
    background_tasks.add_task(forecasting.run_forecast_task, db_run.id, run.dataset_id, run.overrides)
    return {"run_id": db_run.id, "status": "started"}

@router.get("/")
def list_runs(db: Session = Depends(get_db)):
    return db.query(models.ForecastRun).order_by(models.ForecastRun.created_at.desc()).all()

@router.get("/{run_id}")
def get_run(run_id: int, db: Session = Depends(get_db)):
    return db.query(models.ForecastRun).filter(models.ForecastRun.id == run_id).first()

@router.post("/{run_id}/stress")
async def run_stress_test(run_id: int):
    """
    Trigger a stress test (War Games) for a specific run.
    """
    return await forecasting.run_stress_test(run_id)
