import requests
import io
import pandas as pd
import json

def test_upload():
    # Create valid CSV content
    csv_content = """date,value,category
2023-01-01,100,A
2023-01-02,105,A
2023-01-03,110,A
2023-01-04,95,A
2023-01-05,200,A
2023-01-06,102,A
"""
    files = {
        'file': ('test.csv', csv_content, 'text/csv')
    }
    
    print("Sending request to http://localhost:8000/api/datasets/upload...")
    try:
        response = requests.post("http://localhost:8000/api/datasets/upload", files=files)
        
        if response.status_code == 200:
            print("✅ Upload Success!")
            data = response.json()
            print("Response Keys:", data.keys())
            
            # Verify Analysis Structure
            if "radar" in data and "metrics" in data and "analysis" in data:
                print("✅ Rich analysis data verified.")
                print("Metrics:", json.dumps(data.get("metrics"), indent=2))
                print("Radar:", json.dumps(data.get("radar"), indent=2))
                
                # Check for anomaly detection (value 200 is a spike)
                anomalies = data["analysis"].get("anomalies", [])
                if len(anomalies) > 0:
                    print(f"✅ Anomalies detected: {len(anomalies)}")
                else:
                    print("⚠️ No anomalies detected (expected 1 for value 200).")
            else:
                print("❌ Missing analysis keys.", data.keys())
        else:
            print(f"❌ Upload Failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_upload()
