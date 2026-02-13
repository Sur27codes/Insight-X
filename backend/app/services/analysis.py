import pandas as pd
import numpy as np

def smart_downsample(df: pd.DataFrame, max_points: int = 500) -> pd.DataFrame:
    """
    Downsamples the dataframe to a maximum number of points while preserving the shape.
    Uses simple slicing for efficiency on large datasets.
    """
    if len(df) <= max_points:
        return df
    
    # Calculate step size
    step = max(1, len(df) // max_points)
    return df.iloc[::step].copy()


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Intelligently identifies date columns, converts them, and sorts the dataset.
    """
    df = df.copy()
    
    # 1. Identify Date Column
    date_col = None
    common_names = ['date', 'time', 'timestamp', 'year', 'month', 'day', 'ds', 'datetime']
    
    # Check by name
    for col in df.columns:
        if col.lower() in common_names:
            date_col = col
            break
            
    # Check by dtype (if object, try converting)
    if not date_col:
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    pd.to_datetime(df[col], errors='raise')
                    date_col = col
                    break
                except:
                    continue

    # 2. Convert and Sort
    if date_col:
        # Check if numerical
        if pd.api.types.is_numeric_dtype(df[date_col]):
            # Heuristic: If values are small (e.g. years), convert to string first to force Year parsing
            sample_val = df[date_col].dropna().iloc[0]
            if sample_val < 3000: 
                # Likely a Year (e.g. 2022)
                df[date_col] = pd.to_datetime(df[date_col].astype(str), format='%Y', errors='coerce')
            else:
                 if sample_val > 1e11: # ms or ns
                     df[date_col] = pd.to_datetime(df[date_col], unit='ms', errors='coerce')
                 elif sample_val > 1e8: # seconds
                     df[date_col] = pd.to_datetime(df[date_col], unit='s', errors='coerce')
                 else:
                     df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        else:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            
        df = df.sort_values(by=date_col)
        df.rename(columns={date_col: 'date'}, inplace=True)
    
    # 3. Aggressive Numeric Conversion
    # Try to convert object columns to numeric (handling currency symbols, commas)
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                # Remove common non-numeric chars but keep negative signs and decimals
                cleaned = df[col].astype(str).str.replace(r'[$,]', '', regex=True)
                # Try converting to numeric
                converted = pd.to_numeric(cleaned, errors='ignore')
                # If majority are numbers, use it
                if pd.api.types.is_numeric_dtype(converted):
                    df[col] = converted
            except:
                pass

    # 4. Normalize Value Column (for Frontend consistency)
    # Identify the first numeric column that is NOT the date column
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'date' in numeric_cols: numeric_cols.remove('date')
    
    # If we have numeric columns, look for a likely target
    target_col = None
    priority_names = ['value', 'sales', 'revenue', 'profit', 'amount', 'score', 'count', 'price', 'close']
    
    if len(numeric_cols) > 0:
        # 1. Check priority names
        for name in priority_names:
            matches = [c for c in numeric_cols if name in c.lower()]
            if matches:
                target_col = matches[0]
                break
        
        # 2. Fallback to first numeric column
        if not target_col:
            target_col = numeric_cols[0]
            
        # Rename to 'value' for standard processing if needed
        if target_col and target_col != 'value':
             df.rename(columns={target_col: 'value'}, inplace=True)

    return df

async def analyze_csv(df: pd.DataFrame) -> dict:
    """
    Analyzes the uploaded CSV dataframe and returns insights, precautions, and graph config.
    """
    # Ensure processed
    if 'date' not in [c.lower() for c in df.columns]:
         df = preprocess_dataframe(df)

    columns = [c.lower() for c in df.columns]
    
    # Initialize Structure
    result = {
        "analysis": {
            "columns": list(df.columns),
            "graph_type": "bar",
            "precautions": [],
            "recommendations": [],
            "anomalies": [],
            "insights": [] 
        },
        "metrics": {
            "growth": "0%",
            "seasonality": "None",
            "volatility": "Low",
            "mean": 0,
            "median": 0,
            "min": 0,
            "max": 0,
            "total": 0
        },
        "radar": [
            { "subject": 'Accuracy', "A": 85, "fullMark": 100 },
            { "subject": 'Speed', "A": 90, "fullMark": 100 },
            { "subject": 'Stability', "A": 88, "fullMark": 100 },
            { "subject": 'Data Quality', "A": 95, "fullMark": 100 },
            { "subject": 'Resilience', "A": 82, "fullMark": 100 },
        ]
    }

    # 1. Determine Graph Type
    if 'date' in columns:
        result["analysis"]["graph_type"] = "area"
    elif 'category' in columns:
        result["analysis"]["graph_type"] = "bar"

    # 2. Advanced Metrics & Anomalies
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        target = df[numeric_cols[0]]
        
        # Basic Stats
        mean_val = target.mean()
        std_val = target.std()
        min_val = target.min()
        max_val = target.max()
        total_val = target.sum()
        
        result["metrics"]["mean"] = float(mean_val)
        result["metrics"]["median"] = float(target.median())
        result["metrics"]["std_dev"] = float(std_val)
        result["metrics"]["min"] = float(min_val)
        result["metrics"]["max"] = float(max_val)
        result["metrics"]["total"] = float(total_val)
        
        # Volatility
        cov = std_val / mean_val if mean_val != 0 else 0
        if cov > 0.5:
            result["metrics"]["volatility"] = "High"
            result["analysis"]["precautions"].append("High volatility detected. Consider hedging strategies.")
        elif cov > 0.2:
             result["metrics"]["volatility"] = "Medium"
        
        # Growth (Robust)
        start_val = target.iloc[0]
        end_val = target.iloc[-1]
        
        if start_val == 0:
            growth = 100 if end_val > 0 else 0
        else:
            growth = ((end_val - start_val) / abs(start_val)) * 100
            
        result["metrics"]["growth"] = f"{growth:+.1f}%"
        
        # Trend Analysis
        if growth > 20: 
            result["analysis"]["recommendations"].append("Strong uptrend. Allocate more resources to capitalize.")
            result["radar"][1]["A"] = 98 # Speed
        elif growth < -20:
            result["analysis"]["recommendations"].append("Significant decline. Review cost structure immediately.")
            result["radar"][4]["A"] = 60 # Resilience decreased

        # Anomaly Detection (IQR Method)
        q1 = target.quantile(0.25)
        q3 = target.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        anomalies = df[(target < lower_bound) | (target > upper_bound)]
        
        for idx, row in anomalies.head(5).iterrows():
            date_val = row.get('date', f'Row {idx}')
            date_str = str(date_val)
            if hasattr(date_val, 'strftime'):
                date_str = date_val.strftime('%Y-%m-%d')
                
            val = row[numeric_cols[0]]
            reason = "Spike detected" if val > upper_bound else "Drop detected"
            result["analysis"]["anomalies"].append({
                "date": date_str,
                "value": float(val),
                "reason": reason
            })
            
        # Data Quality Score
        null_count = df.isnull().sum().sum()
        total_cells = df.size
        quality_score = max(0, 100 - int((null_count / total_cells) * 100) - (5 if len(anomalies) > 0 else 0))
        result["radar"][3]["A"] = quality_score
        
        if null_count > 0:
             result["analysis"]["precautions"].append(f"Data contains {null_count} missing values.")

        # 3. Recommendations & Narrative Insights
        if len(df) < 50:
            result["analysis"]["precautions"].append("Small dataset size. Forecast confidence reduced.")
            result["radar"][0]["A"] = 65 
        else:
            result["analysis"]["recommendations"].append("Sufficient data depth for advanced Transformer models.")

        # Narrative Generation (Moved inside check)
        # Peak Analysis
        peak_idx = target.idxmax()
        peak_val = target.max()
        peak_date = df.loc[peak_idx]['date'] if 'date' in df.columns else f"Row {peak_idx}"
        result["analysis"]["insights"].append(f"Historical peak of {peak_val:,.2f} reached on {str(peak_date).split(' ')[0]}.")

        # Trough Analysis
        min_idx = target.idxmin()
        min_val = target.min()
        min_date = df.loc[min_idx]['date'] if 'date' in df.columns else f"Row {min_idx}"
        result["analysis"]["insights"].append(f"Lowest point recorded at {min_val:,.2f} on {str(min_date).split(' ')[0]}.")

        # Volatility Narrative
        if cov > 0.5:
            result["analysis"]["insights"].append("Data shows high volatility; expect significant fluctuations.")
        else:
            result["analysis"]["insights"].append("Data remains relatively stable with consistent trends.")

        # Growth Narrative
        if start_val != 0:
            growth_pct = ((end_val - start_val) / abs(start_val)) * 100
            direction = "grew" if growth_pct > 0 else "declined"
            result["analysis"]["insights"].append(f"Overall, the metric {direction} by {abs(growth_pct):.1f}% over the observed period.")

    else:
        # Fallback for no numeric columns
        result["analysis"]["precautions"].append("No numeric data found for analysis.")
        result["analysis"]["insights"].append("Please upload a dataset with at least one numeric column (e.g. Sales, Revenue).")

    # 4. JSON Sanitization
    def clean_for_json(obj):
        if isinstance(obj, dict):
            return {k: clean_for_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [clean_for_json(v) for v in obj]
        elif isinstance(obj, float):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return obj
        return obj

    return clean_for_json(result)
