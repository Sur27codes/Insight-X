import logging
import boto3
from app.core.config import get_settings
from app.db import models
from fastapi import UploadFile

settings = get_settings()
logger = logging.getLogger(__name__)

def get_s3_client():
    endpoint_url = settings.MINIO_ENDPOINT
    if not endpoint_url.startswith("http"):
        endpoint_url = f"http://{endpoint_url}"

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
    )

async def upload_dataset(file_obj, filename: str, db, content_type: str = "text/csv"):
    s3 = get_s3_client()
    bucket_name = "datasets"
    
    # Ensure bucket exists
    try:
        s3.head_bucket(Bucket=bucket_name)
    except:
        s3.create_bucket(Bucket=bucket_name)
    
    key = f"{filename}"
    s3.upload_fileobj(file_obj, bucket_name, key)
    
    db_dataset = models.Dataset(
        filename=filename,
        s3_key=key,
        metadata_info={
            "size": 0, 
            "content_type": content_type
        }
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    
    return db_dataset
