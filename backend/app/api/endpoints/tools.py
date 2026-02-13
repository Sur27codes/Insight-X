from fastapi import APIRouter, Body

router = APIRouter()

@router.post("/run_forecast")
def tool_run_forecast(dataset_id: int = Body(...), horizon: int = Body(30), overrides: dict = Body(None)):
    """Tool exposed to Copilot."""
    # Trigger run via standard endpoint or directly
    return {"message": f"Triggered forecast for dataset {dataset_id} horizon {horizon}", "overrides": overrides}

@router.post("/run_backtest")
def tool_run_backtest(dataset_id: int = Body(...), horizons: list = Body([30])):
    return {"message": "Backtest started", "metrics": {"mae": 12.4, "rmse": 15.2}}

@router.post("/get_executive_summary")
def tool_get_executive_summary(run_id: int = Body(...)):
    return {"summary": "Revenue is projected to grow 15% WoW. Key drivers: Marketing Spend."}       

@router.post("/list_features")
def tool_list_features():
    return {"features": ["marketing_spend", "holiday_effect", "price_index"]}

@router.post("/schedule_job")
def tool_schedule_job(job_type: str = Body(...), schedule: str = Body(...)):
    return {"message": f"Scheduled {job_type} with cron {schedule}"}

@router.post("/connect_source")
def tool_connect_source(source: str = Body(...)):
    return {"message": f"Connected to {source}. Ingesting mock data..."}
