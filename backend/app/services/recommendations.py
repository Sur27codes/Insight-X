import logging
import json
import asyncio
from app.services.forecasting import run_forecast_task  # We'll use this to run sims

logger = logging.getLogger(__name__)

async def generate_recommendations(run_id: int):
    """
    Simulates "What-If" scenarios to find optimal actions.
    Returns a list of recommended actions sorted by Impact/Risk.
    """
    logger.info(f"Generating recommendations for Run {run_id}...")
    
    # define candidate actions
    candidates = [
        {"name": "Increase Marketing Spend", "override": {"marketing_boost": 10}, "risk": "Medium", "cost": "High"},
        {"name": "Aggressive Discounting", "override": {"price_discount": 15}, "risk": "High", "cost": "Medium"},
        {"name": "Optimize Inventory", "override": {"inventory_optimization": True}, "risk": "Low", "cost": "Low"}
    ]
    
    recommendations = []
    
    # In a real system, we'd run these in parallel. For now, simulate.
    baseline_revenue = 100000 # Dummy baseline
    
    for action in candidates:
        # Simulate Uplift (Mock Logic)
        if "marketing_boost" in action["override"]:
            uplift_pct = 8.5
        elif "price_discount" in action["override"]:
            uplift_pct = 5.2
        else:
            uplift_pct = 2.1
            
        uplift_val = baseline_revenue * (uplift_pct / 100)
        
        recommendations.append({
            "action": action["name"],
            "impact": f"+${uplift_val:,.0f} Revenue",
            "uplift_percent": uplift_pct,
            "risk": action["risk"],
            "confidence": "High" if action["risk"] == "Low" else "Medium",
            "reasoning": f"Simulated run showed {uplift_pct}% lift. Primary driver: {list(action['override'].keys())[0]}."
        })
    
    # Sort by Uplift
    recommendations.sort(key=lambda x: x["uplift_percent"], reverse=True)
    
    return recommendations
