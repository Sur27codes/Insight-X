from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.services import data_service
from app.db.session import get_db
from app.db import models

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        import io
        import pandas as pd
        import numpy as np
        from app.services.analysis import analyze_csv, smart_downsample, preprocess_dataframe
        
        # 1. Analyze
        df = pd.read_csv(io.BytesIO(contents))
        
        # Preprocess (Identify/Parse Dates, Sort)
        df = preprocess_dataframe(df)
        
        analysis_result = await analyze_csv(df)
        
        # 2. Upload
        # NOTE: We are uploading the ORIGINAL raw content for integrity, 
        # but the analysis/preview uses the processed version.
        file_obj = io.BytesIO(contents)
        dataset_record = await data_service.upload_dataset(
            file_obj=file_obj, 
            filename=file.filename, 
            db=db,
            content_type=file.content_type
        )
        
        # Prepare Preview Data (Smart Downsampled)
        preview_df = smart_downsample(df, max_points=1000)
        # Sanitize for JSON (Nan/Inf -> None)
        preview_df = preview_df.replace([np.inf, -np.inf], None).where(pd.notnull(preview_df), None)
        
        # Ensure date column is formatted as string for JSON
        if 'date' in preview_df.columns:
            preview_df['date'] = preview_df['date'].astype(str)
            
        preview_data = preview_df.to_dict(orient='records')
        
        return {
            "dataset": dataset_record,
            "analysis": analysis_result["analysis"],
            "metrics": analysis_result["metrics"],
            "radar": analysis_result["radar"],
            "preview": preview_data
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/upload-url")
async def upload_dataset_from_url(url: str, db: Session = Depends(get_db)):
    try:
        import requests
        import io
        import pandas as pd
        import numpy as np
        from app.services.analysis import analyze_csv, smart_downsample, preprocess_dataframe
        
        # 1. Fetch
        response = requests.get(url)
        response.raise_for_status()
        contents = response.content
        filename = url.split("/")[-1] or "downloaded_data.csv"
        
        # 2. Analyze
        df = pd.read_csv(io.BytesIO(contents))
        
        # Preprocess
        df = preprocess_dataframe(df)
        
        analysis_result = await analyze_csv(df)
        
        # 3. Upload
        file_obj = io.BytesIO(contents)
        dataset_record = await data_service.upload_dataset(
            file_obj=file_obj, 
            filename=filename, 
            db=db,
            content_type="text/csv"
        )
        
        # Prepare Preview
        preview_df = smart_downsample(df, max_points=1000)
        preview_df = preview_df.replace([np.inf, -np.inf], None).where(pd.notnull(preview_df), None)
        
        if 'date' in preview_df.columns:
            preview_df['date'] = preview_df['date'].astype(str)
            
        preview_data = preview_df.to_dict(orient='records')
        
        return {
            "dataset": dataset_record,
            "analysis": analysis_result["analysis"],
            "metrics": analysis_result["metrics"],
            "radar": analysis_result["radar"],
            "preview": preview_data
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"URL Upload failed: {str(e)}")

@router.get("/")
def list_datasets(db: Session = Depends(get_db)):
    return db.query(models.Dataset).all()
