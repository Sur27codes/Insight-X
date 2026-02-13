import numpy as np
import logging
from scipy.stats import ks_2samp

logger = logging.getLogger(__name__)

def check_drift(reference_data: list, current_data: list) -> dict:
    """
    Checks for data drift using Kolmogorov-Smirnov test.
    Returns a dictionary with drift detected status and p-value.
    """
    logger.info("Checking for data drift...")
    
    # Validation
    if not reference_data or not current_data:
        return {"drift_detected": False, "reason": "Insufficient data"}
    
    # Convert to numpy arrays
    ref_arr = np.array(reference_data)
    curr_arr = np.array(current_data)
    
    # Perform KS Test
    statistic, p_value = ks_2samp(ref_arr, curr_arr)
    
    # Drift if p-value < 0.05 (reject null hypothesis that distributions are same)
    drift_detected = p_value < 0.05
    
    result = {
        "drift_detected": drift_detected,
        "statistic": statistic,
        "p_value": p_value,
        "message": "Drift detected!" if drift_detected else "No significant drift."
    }
    logger.info(f"Drift Check Result: {result}")
    return result
