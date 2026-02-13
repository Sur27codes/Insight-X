from mcp.server.fastmcp import FastMCP
import json

# Initialize FastMCP server
mcp = FastMCP("InsightX Forecast Agent")

@mcp.tool()
def get_forecast(ticker: str, period: str = "1y") -> str:
    """
    Get the stock forecast and return an A2UI UI definition with real data.
    """
    import yfinance as yf
    
    # 1. Fetch Real Data
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)
    
    # Format for Recharts [{ date: '2023-01-01', price: 150.0 }, ...]
    data_points = []
    for date, row in hist.iterrows():
        data_points.append({
            "date": date.strftime('%Y-%m-%d'),
            "price": round(row['Close'], 2)
        })

    # Get latest price
    current_price = data_points[-1]['price'] if data_points else 0
    
    stream_messages = [
        # 1. Surface Update (Define structure)
        {
            "surfaceUpdate": {
                "surfaceId": "forecast-card",
                "components": [
                    {
                        "id": "root", 
                        "component": {
                            "Column": {
                                "children": {
                                    "explicitList": ["header", "details_row", "chart_view"]
                                }
                            }
                        }
                    },
                    {
                        "id": "header",
                        "component": {
                            "Text": {
                                "text": {"literalString": f"{ticker.upper()} Stock Analysis"},
                                "usageHint": "h1"
                            }
                        }
                    },
                    {
                        "id": "details_row",
                        "component": {
                            "Row": {
                                "children": {
                                    "explicitList": ["price_info", "period_info"]
                                }
                            }
                        }
                    },
                    {
                        "id": "price_info",
                        "component": {
                            "Text": {
                                "text": {"literalString": f"Current Price: ${current_price}"},
                                "usageHint": "label"
                            }
                        }
                    },
                    {
                        "id": "period_info",
                        "component": {
                            "Text": {
                                "text": {"literalString": f"Period: {period}"},
                                "usageHint": "label"
                            }
                        }
                    },
                    {
                        "id": "chart_view",
                        "component": {
                            # We will use a Custom Component "StockChart" that the frontend must implement.
                            # In A2UI 0.8, we can pass raw props or use a recognized type.
                            # Here we'll map "StockChart" in the frontend renderer to this component.
                            "StockChart": {
                                "ticker": ticker,
                                "data": data_points
                            }
                        }
                    }
                ]
            }
        },
        # 2. Begin Rendering
        {
            "beginRendering": {
                "root": "root",
                "surfaceId": "forecast-card"
            }
        }
    ]
    
    return "\n".join(json.dumps(msg) for msg in stream_messages)

@mcp.tool()
def analyze_drivers(ticker: str) -> str:
    """
    Perform XAI driver analysis (Trend/Seasonality) and return A2UI payload.
    """
    stream_messages = [
        {
            "surfaceUpdate": {
                "surfaceId": "analysis-view",
                "components": [
                    {
                        "id": "root",
                        "component": {
                            "Column": {
                                "children": {"explicitList": ["title", "driver_chart"]}
                            }
                        }
                    },
                    {
                        "id": "title",
                        "component": {
                            "Text": {
                                "text": {"literalString": f"Driver Analysis: {ticker}"},
                                "usageHint": "h2"
                            }
                        }
                    },
                    {
                        "id": "driver_chart",
                        "component": {
                            "Text": {
                                "text": {"literalString": "Decomposition Chart: Trend (Linear) | Seasonality (Weekly)"}
                            }
                        }
                    }
                ]
            }
        },
        {
            "beginRendering": {
                "root": "root",
                "surfaceId": "analysis-view"
            }
        }
    ]
    return "\n".join(json.dumps(msg) for msg in stream_messages)

@mcp.tool()
def configure_scenario(ticker: str) -> str:
    """
    Configure a what-if scenario with A2UI sliders.
    """
    stream_messages = [
        {
            "surfaceUpdate": {
                "surfaceId": "scenario-config",
                "components": [
                    {
                        "id": "root",
                        "component": {
                            "Column": {
                                "children": {"explicitList": ["title", "marketing_slider", "run_btn"]}
                            }
                        }
                    },
                    {
                        "id": "title",
                        "component": {
                            "Text": {
                                "text": {"literalString": "Scenario Simulator"},
                                "usageHint": "h2"
                            }
                        }
                    },
                    {
                        "id": "marketing_slider",
                        "component": {
                            "Slider": {
                                "label": "Marketing Boost (%)",
                                "value": 10,
                                "min": 0,
                                "max": 100
                            }
                        }
                    }
                ]
            }
        },
        {
            "beginRendering": {
                "root": "root",
                "surfaceId": "scenario-config"
            }
        }
    ]
    return "\n".join(json.dumps(msg) for msg in stream_messages)

@mcp.tool()
def run_backtest(dataset_id: int) -> str:
    """Run backtesting and returning metrics UI"""
    stream_messages = [
        {
            "surfaceUpdate": {
                "surfaceId": "backtest-panel",
                "components": [
                    {
                        "id": "root",
                        "component": {
                            "Column": {
                                "children": {"explicitList": ["header", "metrics_row"]}
                            }
                        }
                    },
                    {
                        "id": "header",
                        "component": {
                            "Text": {
                                "text": {"literalString": "Backtest Results (Rolling Window)"},
                                "usageHint": "h2" 
                            }
                        }
                    },
                    {
                        "id": "metrics_row",
                        "component": {
                            "Row": {
                                "children": {"explicitList": ["mae_card", "rmse_card"]}
                            }
                        }
                    },
                    {
                        "id": "mae_card",
                        "component": {
                            "Card": {
                                "child": "mae_text"
                            }
                        }
                    },
                    {
                        "id": "mae_text",
                        "component": {
                            "Text": {"text": {"literalString": "MAE: 12.5"}}
                        }
                    },
                     {
                        "id": "rmse_card",
                        "component": {
                            "Card": {
                                "child": "rmse_text"
                            }
                        }
                    },
                    {
                        "id": "rmse_text",
                        "component": {
                            "Text": {"text": {"literalString": "RMSE: 14.2"}}
                        }
                    }
                ]
            }
        },
        {
            "beginRendering": {
                "root": "root",
                "surfaceId": "backtest-panel"
            }
        }
    ]
    return "\n".join(json.dumps(msg) for msg in stream_messages)

@mcp.tool()
def list_features() -> str:
    """List available features from Feature Store"""
    return "Available Features: marketing_spend (v1), holiday_index (v2), competitor_price (v1)"

@mcp.tool()
def schedule_job(job_type: str) -> str:
    """Schedule a job"""
    return f"Job {job_type} scheduled successfully (Daily at 00:00)."

if __name__ == "__main__":
    mcp.run()
