from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Dataset(Base):
    __tablename__ = "uploaded_datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    s3_key = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    metadata_info = Column(JSON, nullable=True)

class ForecastRun(Base):
    __tablename__ = "forecast_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("uploaded_datasets.id"))
    status = Column(String, default="pending")  # pending, running, completed, failed
    model_type = Column(String)
    horizon = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    results = Column(JSON, nullable=True)
    parameters = Column(JSON, nullable=True) # Versioning support
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True) # RBAC support
    reliability_score = Column(Float, nullable=True) # 0.0 to 1.0
    warnings = Column(JSON, nullable=True) # List of warning strings

class Decision(Base):
    __tablename__ = "decisions"
    
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("forecast_runs.id"))
    action_taken = Column(String) # e.g. "scenario_applied"
    details = Column(JSON)
    status = Column(String) # recommended, rejected, applied
    created_at = Column(DateTime, default=datetime.utcnow)

class FeatureStore(Base):
    __tablename__ = "feature_store"
    
    id = Column(Integer, primary_key=True, index=True)
    feature_name = Column(String, unique=True, index=True)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    version = Column(Integer, default=1)
    schema_info = Column(JSON)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String) # analyst, executive, admin

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
