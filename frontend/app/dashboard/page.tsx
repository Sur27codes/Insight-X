"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DynamicChart } from '@/components/dashboard/DynamicChart';
import { SmartVisualization } from '@/components/dashboard/SmartVisualization';
import { StockChart } from '@/components/agentic/StockChart';
import { GlassCard, GlassButton, GlassModal } from '@/components/ui/GlassPrimitives';
import { ModelRadar } from '@/components/dashboard/ModelRadar';
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

// Hook stub for WebSocket
const useWebSocketEvents = () => {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setEvents(prev => [...prev, data]);
        };

        return () => ws.close();
    }, []);

    return events;
};

function DashboardContent() {
    const events = useWebSocketEvents();
    const router = useRouter();
    const searchParams = useSearchParams();
    // We use a local state for immediate UI feedback, but sync with URL
    const currentTab = searchParams.get('tab') || 'overview';

    // Helper to switch tabs
    const setTab = (tab: string) => {
        router.push(`?tab=${tab}`);
    };

    const [chartData, setChartData] = useState<any[]>([
        { date: '2024-01', value: 4000 },
        { date: '2024-02', value: 3000 },
        { date: '2024-03', value: 2000 },
        { date: '2024-04', value: 2780 },
    ]);
    const [status, setStatus] = useState("Idle");
    const [summary, setSummary] = useState("");
    const [metrics, setMetrics] = useState<any>(null); // State for detailed metrics
    const [decomposition, setDecomposition] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Agentic State
    const [stockData, setStockData] = useState<any>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [radarData, setRadarData] = useState<any>(null);

    // Navigation Action
    useCopilotAction({
        name: "navigate_dashboard",
        description: "Navigates to a specific section of the dashboard (Overview, Datasets, Scenarios).",
        parameters: [
            { name: "section", type: "string", description: "The section to go to (overview, datasets, scenarios)." }
        ],
        handler: async ({ section }) => {
            setTab(section.toLowerCase());
            return `Navigated to ${section}.`;
        }
    });

    useCopilotAction({
        name: "show_stock_price",
        description: "Displays a real-time stock price graph for a given company ticker.",
        parameters: [
            { name: "ticker", type: "string", description: "The stock ticker symbol (e.g. TSLA, AAPL)" },
            { name: "period", type: "string", description: "Time period (1d, 5d, 1mo, 1y). Default is 1y." }
        ],
        handler: async ({ ticker, period }) => {
            setStatus(`Fetching ${ticker}...`);
            setTab('overview'); // Ensure user sees the stock chart
            try {
                const res = await fetch(`http://localhost:8000/api/stocks/${ticker}?period=${period || '1y'}`);
                if (res.ok) {
                    const data = await res.json();
                    setStockData(data);
                    setStatus("Stock Data Loaded");
                    return `Displayed graph for ${ticker}. Current Price: $${data.meta.current_price}`;
                } else {
                    return "Failed to fetch stock data.";
                }
            } catch (e) {
                console.error(e);
                return "Error connecting to market data service.";
            }
        }
    });

    // New: Market Trading Action
    useCopilotAction({
        name: "simulate_trade",
        description: "Executes a simulated trade order for a stock.",
        parameters: [
            { name: "ticker", type: "string", description: "Stock Ticker (e.g. AAPL)" },
            { name: "action", type: "string", description: "BUY or SELL" },
            { name: "quantity", type: "number", description: "Number of shares" }
        ],
        handler: async ({ ticker, action, quantity }) => {
            const price = Math.floor(Math.random() * 500) + 50;
            const total = price * quantity;
            setStatus(`Executed ${action} ${ticker}`);
            return `✅ Successfully executed ${action} order for ${quantity} shares of ${ticker} at $${price}. Total: $${total.toLocaleString()}. Portfolio updated.`;
        }
    });

    // New: Market News Action
    useCopilotAction({
        name: "get_market_news",
        description: "Fetches the latest breaking news for the financial markets.",
        handler: async () => {
            return "📰 **Breaking Market News:**\n" +
                "1. **Fed Signals Rate Cuts:** Federal Reserve hints at potential rate cuts in Q3 as inflation cools.\n" +
                "2. **Tech Sector Rally:** AI stocks surge following major earnings beat from leading chipmakers.\n" +
                "3. **Oil Prices Stabilize:** Global crude prices steady amidst supply chain adjustments.";
        }
    });

    // New: Real-time Market Summary Action
    useCopilotAction({
        name: "get_market_summary",
        description: "Fetches current market rates for major indices (S&P 500, Nasdaq, Dow Jones) to provide a real-time market overview.",
        handler: async () => {
            setStatus("Fetching Market Data...");
            try {
                const indices = ["SPY", "QQQ", "DIA"];
                const results = await Promise.all(indices.map(async (ticker) => {
                    const res = await fetch(`http://localhost:8000/api/stocks/${ticker}?period=1d`);
                    if (res.ok) return await res.json();
                    return null;
                }));

                const validResults = results.filter(r => r !== null);
                if (validResults.length === 0) return "Failed to fetch market data.";

                const summary = validResults.map((r: any) => {
                    const symbol = r.ticker === "SPY" ? "S&P 500" : r.ticker === "QQQ" ? "Nasdaq" : "Dow Jones";
                    const price = r.meta.current_price;
                    const change = r.meta.change_pct;
                    const arrow = change >= 0 ? "🟢" : "🔴";
                    return `${arrow} **${symbol}**: $${price} (${change > 0 ? '+' : ''}${change}%)`;
                }).join("\n");

                return "### 📈 Real-time Market Rates:\n" + summary;
            } catch (e) {
                return "Error fetching market rates.";
            }
        }
    });

    // New: Trigger File Upload Action
    useCopilotAction({
        name: "trigger_file_upload",
        description: "Opens the system file picker dialog to let the user upload a dataset.",
        handler: async () => {
            document.getElementById('file-upload')?.click();
            return "📂 **Opening file picker...** Please select your dataset.";
        }
    });

    // --- Context Injection for Chatbot ---
    // This allows the AI to "see" the uploaded data analysis
    useCopilotReadable({
        description: "The current dataset's statistical metrics and analysis insights.",
        value: {
            metrics: metrics,
            analysis: analysisData,
            summary: "This is the active dataset uploaded by the user. Use these metrics to answer questions about the report."
        }
    });


    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState("");

    const handleUrlUpload = async () => {
        if (!urlInput) return;
        setStatus("Fetching from URL...");
        try {
            const res = await fetch(`http://localhost:8000/api/datasets/upload-url?url=${encodeURIComponent(urlInput)}`, {
                method: 'POST'
            });
            if (res.ok) {
                const response = await res.json();
                processUploadResponse(response);
            } else {
                setStatus("URL Fetch Failed");
            }
        } catch (e) {
            console.error(e);
            setStatus("Error");
        }
    };

    const processUploadResponse = (response: any) => {
        setStatus("Analysis Complete");
        setAnalysisData(response.analysis);
        setMetrics(response.metrics);
        setRadarData(response.radar);

        // Direct user to graph view
        setTab('datasets');

        if (response.preview && response.preview.length > 0) {
            const previewData = response.preview.map((row: any, idx: number) => ({
                date: row.date || row.ds || `Row ${idx}`,
                value: row.value || row.y || 0,
                type: 'history',
                isAnomaly: false
            }));
            setChartData(previewData);
        }

        // Trigger Forecast
        fetch("http://localhost:8000/api/runs/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dataset_id: response.dataset.id,
                horizon: 30
            })
        });
        setRadarData(response.radar);

        if (response.preview && response.preview.length > 0) {
            const previewData = response.preview.map((row: any, idx: number) => ({
                date: row.date || row.ds || `Row ${idx}`,
                value: row.value || row.y || 0,
                type: 'history',
                isAnomaly: false
            }));
            setChartData(previewData);
        }

        // Trigger Forecast
        fetch("http://localhost:8000/api/runs/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dataset_id: response.dataset.id,
                horizon: 30
            })
        });
    };

    // Effect to process events (AG-UI logic)
    useEffect(() => {
        const lastEvent = events[events.length - 1];
        if (lastEvent) {
            if (lastEvent.type === 'run.completed') {
                setStatus("Completed");
                if (lastEvent.payload.results) {
                    const results = lastEvent.payload.results;
                    const anomaliesSet = new Set(results.anomalies || []);

                    // 1. Process History Data
                    const historyData = (results.history?.values || []).map((val: number, idx: number) => ({
                        date: results.history?.dates?.[idx] || `Hist ${idx}`,
                        value: val,
                        type: 'history',
                        isAnomaly: false
                    }));

                    // 2. Process Forecast Data
                    const forecastData = results.forecast.map((val: number, idx: number) => {
                        const date = results.dates[idx] || `Day ${idx}`;
                        return {
                            date,
                            value: val,
                            type: 'forecast',
                            isAnomaly: anomaliesSet.has(date),
                            trend: results.decomposition?.trend?.[idx],
                            seasonal: results.decomposition?.seasonal?.[idx],
                            confidence_lower: results.confidence_lower?.[idx],
                            confidence_upper: results.confidence_upper?.[idx]
                        };
                    });

                    // Combine: History -> Forecast
                    const newChartData = [...historyData, ...forecastData];

                    setChartData(newChartData);
                    setDecomposition(results.decomposition);
                    setMetrics(results.metrics); // Store metrics
                    if (results.analysis) {
                        setAnalysisData(results.analysis);
                    }
                }
            } else if (lastEvent.type === 'copilot.summary') {
                setSummary(lastEvent.payload.text);
            }
        }
    }, [events]);

    const fetchHistory = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/runs");
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
                setIsHistoryOpen(true);
            } else {
                console.error("Failed to fetch history");
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-8 lg:p-12 relative overflow-hidden">
            {/* Header */}
            <div className="z-10 max-w-6xl w-full flex items-center justify-between font-mono text-sm mb-8">
                <div className="pill-logo backdrop-blur-xl">InsightX / <span className="text-cyan-400 capitalize">{currentTab}</span></div>
                <div className="glass-panel px-4 py-1 rounded-full text-white/70 text-xs">
                    {status}
                </div>
            </div>

            {/* AI Insight Banner */}
            {summary && (
                <GlassCard className="w-full max-w-6xl mb-8 border-l-4 border-cyan-400 bg-cyan-900/10">
                    <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        AI Executive Summary
                    </h3>
                    <p className="text-white/90 leading-relaxed">{summary}</p>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Main Chart Card */}
                <GlassCard className="col-span-2 min-h-[500px]" delay={0.1}>
                    <h2 className="text-2xl font-bold mb-6 text-white flex justify-between items-center">
                        <span>
                            {currentTab === 'datasets' ? 'Dataset Analytics' :
                                currentTab === 'scenarios' ? 'Scenario Simulation' :
                                    'Revenue Forecast'}
                        </span>
                        {decomposition && (
                            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/50 font-normal border border-white/5">XAI Enabled</span>
                        )}
                    </h2>
                    {analysisData ? (
                        <SmartVisualization data={chartData} analysis={analysisData} metrics={metrics} />
                    ) : (
                        <div className="h-[400px]">
                            <DynamicChart
                                data={chartData}
                                type="area"
                                dataKeys={{
                                    x: 'date',
                                    y: 'value',
                                    confidence: ['confidence_lower', 'confidence_upper']
                                }}
                                colors={{ primary: '#06b6d4' }}
                            />
                        </div>
                    )}
                </GlassCard>

                {/* Agentic Stock Output (Conditional) */}
                {stockData && (
                    <div className="col-span-2 lg:col-span-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <StockChart stock={stockData} />
                    </div>
                )}


                {/* Actions Panel */}
                <div className="flex flex-col gap-6">
                    <GlassCard delay={0.2} className="h-full">
                        <h3 className="text-xl font-bold mb-6 text-gradient">Control Center</h3>
                        <p className="mb-4 text-gray-400 text-sm">
                            {currentTab === 'datasets' ? 'Upload new data sources to the decision engine.' :
                                currentTab === 'scenarios' ? 'Stress test your forecast against black swan events.' :
                                    'Command the agent to generate new predictions.'}
                        </p>

                        {/* Trendy Radar Visualization */}
                        <div className="mb-8">
                            <ModelRadar data={radarData} />
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append("file", file);
                                setStatus(`Uploading ${file.type}...`);

                                try {
                                    const res = await fetch("http://localhost:8000/api/datasets/upload", {
                                        method: "POST",
                                        body: formData
                                    });
                                    if (res.ok) {
                                        const response = await res.json();
                                        processUploadResponse(response);
                                    } else {
                                        setStatus("Upload Failed");
                                    }
                                } catch (err) {
                                    console.error(err);
                                    setStatus("Error");
                                }
                            }}
                        />

                        <div className="space-y-4">
                            <GlassButton onClick={() => document.getElementById('file-upload')?.click()}>
                                {currentTab === 'datasets' ? 'Upload File' : 'Upload Data'}
                            </GlassButton>

                            <GlassButton onClick={() => setShowUrlInput(!showUrlInput)} variant="secondary">
                                {showUrlInput ? 'Cancel' : 'Load from URL'}
                            </GlassButton>
                        </div>

                        {showUrlInput && (
                            <div className="mt-4 flex gap-2 animate-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    placeholder="https://example.com/data.csv"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                                <GlassButton onClick={handleUrlUpload} className="!px-3">
                                    Go
                                </GlassButton>
                            </div>
                        )}

                        {metrics && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Live Drivers</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                        <span className="text-gray-400 text-sm">Growth Trend</span>
                                        <span className={`text-sm font-mono font-bold ${metrics.growth.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {metrics.growth}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                        <span className="text-gray-400 text-sm">Seasonality</span>
                                        <span className="text-cyan-400 text-sm font-mono">{metrics.seasonality}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
                <a href="/" className="text-gray-500 hover:text-white text-sm">&larr; Return to Portal</a>
            </div>

            {/* History Modal */}
            <GlassModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                title="Forecast History"
            >
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-gray-400">No runs found.</p>
                    ) : (
                        history.map((run: any) => (
                            <div key={run.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex justify-between items-center">
                                <div>
                                    <div className="text-white font-medium">Run #{run.id}: {run.model_type}</div>
                                    <div className="text-xs text-gray-500">{new Date(run.created_at).toLocaleString()}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs ${run.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                    run.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                        'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {run.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </GlassModal>
        </main >
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Loading Interface...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
