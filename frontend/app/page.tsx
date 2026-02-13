"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard, GlassButton, GlassModal } from '@/components/ui/GlassPrimitives';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

const Typewriter = ({ texts }: { texts: string[] }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    // Typing logic
    useEffect(() => {
        if (subIndex === texts[index].length + 1 && !reverse) {
            setTimeout(() => setReverse(true), 1000);
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % texts.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 75 : subIndex === texts[index].length ? 1000 : 150, Math.random() * 50));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, texts]);

    return (
        <span className="text-cyan-400 font-bold">
            {`${texts[index].substring(0, subIndex)}${blink ? "|" : " "}`}
        </span>
    );
};

export default function LandingPage() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isStressTestOpen, setIsStressTestOpen] = useState(false);

    // War Games State
    const [simulationData, setSimulationData] = useState<any>(null); // { baseline, scenarios }
    const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
    const [status, setStatus] = useState("");

    const runStressTest = async () => {
        setIsStressTestOpen(true);
        setStatus("Initializing War Room...");
        setSimulationData(null);
        setSelectedScenarioId(null);

        // Assuming run_id 1 for demo or fetching active run
        try {
            const res = await fetch("http://localhost:8000/api/runs/1/stress", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setSimulationData(data);
                if (data.scenarios && data.scenarios.length > 0) {
                    setSelectedScenarioId(data.scenarios[0].id);
                }
                setStatus("Simulation Active");
            } else {
                setStatus("Simulation Failed");
            }
        } catch (e) {
            console.error(e);
            setStatus("Connection Error");
        }
    };

    const handleUpload = async () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) return;

        setStatus("Uploading...");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/api/datasets/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setStatus("Upload Complete");
                // Optional: Redirect to dashboard or show analysis
                // For now, close modal after short delay
                setTimeout(() => setIsUploadOpen(false), 1000);
            } else {
                setStatus("Upload Failed");
            }
        } catch (e) {
            console.error(e);
            setStatus("Error Uploading");
        }
    };

    // Prepare Chart Data
    const getChartData = () => {
        if (!simulationData || !selectedScenarioId) return [];

        const baseline = simulationData.baseline;
        const scenario = simulationData.scenarios.find((s: any) => s.id === selectedScenarioId);

        if (!baseline || !scenario) return [];

        return baseline.dates.map((date: string, i: number) => ({
            date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            Baseline: baseline.data[i],
            [scenario.name]: scenario.data[i]
        }));
    };

    const activeScenario = simulationData?.scenarios?.find((s: any) => s.id === selectedScenarioId);

    return (
        <main className="flex min-h-screen bg-[#030712] text-white overflow-hidden relative selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-700" />

            {/* Sidebar (Visual Only for now) */}
            <aside className="w-20 hidden lg:flex flex-col items-center py-8 border-r border-white/5 bg-white/[0.02] backdrop-blur-xl z-20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 mb-12 shadow-lg shadow-cyan-500/20" />
                <div className="flex flex-col gap-8">
                    <div className="p-3 rounded-lg bg-white/10 text-cyan-400"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></div>
                    <div className="p-3 rounded-lg hover:bg-white/5 text-gray-500 transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                    <div className="p-3 rounded-lg hover:bg-white/5 text-gray-500 transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10 scrollbar-hide">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-sm font-semibold text-cyan-400 tracking-wider mb-2 uppercase">Systems Online</h2>
                        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
                            InsightX <span className="text-gray-500 font-light">Control</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl text-lg">
                            Enterprise intelligence active. <Typewriter texts={["Ready for analysis.", "Waiting for input.", "System nominal."]} />
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard">
                            <GlassButton className="!px-8 !py-3">
                                <span className="relative flex h-3 w-3 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                </span>
                                Enter Portal
                            </GlassButton>
                        </Link>
                    </div>
                </header>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[600px]">

                    {/* Main Hero Card (Spans 2x2) */}
                    <div className="md:col-span-2 md:row-span-2">
                        <Link href="/dashboard?tab=forecast" className="h-full block">
                            <GlassCard className="h-full flex flex-col justify-between group hover:border-cyan-500/30">
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                                            Recommended
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Start Forecast</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        Launch the ensemble model (Prophet + XGBoost). Generate 90-day revenue predictions with confidence intervals.
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <div className="h-32 w-full bg-gradient-to-t from-cyan-500/10 to-transparent rounded-xl border border-white/5 relative overflow-hidden">
                                        {/* Fake Graph Line */}
                                        <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                                            <path d="M0 100 Q 150 20 300 80 T 600 40" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                                            <path d="M0 100 Q 150 20 300 80 T 600 40 V 120 H 0 Z" fill="url(#grad)" opacity="0.2" />
                                            <defs>
                                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#06b6d4" />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </div>

                    {/* Secondary Cards */}
                    <div className="md:col-span-1 md:row-span-2 flex flex-col gap-6">
                        <div onClick={() => setIsUploadOpen(true)} className="flex-1 block cursor-pointer">
                            <GlassCard className="h-full group hover:border-blue-500/30 transition-all active:scale-95">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 w-fit mb-4">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Datasets</h3>
                                <p className="text-sm text-gray-400">Click to upload CSV data.</p>
                            </GlassCard>
                        </div>
                        <div onClick={runStressTest} className="flex-1 block cursor-pointer">
                            <GlassCard className="h-full group hover:border-purple-500/30 transition-all active:scale-95">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit mb-4">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5 5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">War Games</h3>
                                <p className="text-sm text-gray-400">Run Crisis Simulation.</p>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Stats Column */}
                    <div className="md:col-span-1 md:row-span-2 flex flex-col gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex-1 backdrop-blur-md">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Live Metrics</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Active Models</span>
                                    <span className="text-white font-mono">3</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-cyan-500" />
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Accuracy</span>
                                    <span className="text-emerald-400 font-mono text-sm">94.2%</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[94%] bg-emerald-500" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                            <h4 className="relative z-10 text-white font-bold text-lg mb-1">New Features</h4>
                            <p className="relative z-10 text-white/80 text-xs">Drift Detection Enabled</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <GlassModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                title="Upload Dataset"
            >
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-400">Select a CSV file to ingest into the Data Lake.</p>
                    <input type="file" className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-xs file:font-semibold
                        file:bg-cyan-500/10 file:text-cyan-400
                        hover:file:bg-cyan-500/20"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <GlassButton onClick={() => setIsUploadOpen(false)} variant="secondary">Cancel</GlassButton>
                        <GlassButton onClick={handleUpload}>Upload</GlassButton>
                    </div>
                </div>
            </GlassModal>

            {/* WAR ROOM MODAL */}
            <GlassModal
                isOpen={isStressTestOpen}
                onClose={() => setIsStressTestOpen(false)}
                title="War Games: Crisis Simulation"
            >
                <div className="p-1 min-h-[500px] flex flex-col md:flex-row gap-6">
                    {/* LEFT PANEL: SCENARIO SELECTOR */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4 border-r border-white/10 pr-6">
                        <div className="mb-2">
                            <span className="text-xs uppercase tracking-widest text-gray-500">System Status</span>
                            <div className="text-cyan-400 animate-pulse font-mono text-sm">{status}</div>
                        </div>

                        {simulationData && simulationData.scenarios && (
                            <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-bold text-white mb-2">Select Scenario</h4>
                                {simulationData.scenarios.map((s: any) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedScenarioId(s.id)}
                                        className={`text-left p-4 rounded-xl border transition-all duration-300 group
                                            ${selectedScenarioId === s.id
                                                ? `bg-${s.color === '#ef4444' ? 'red' : s.color === '#f97316' ? 'orange' : 'emerald'}-500/20 border-${s.color === '#ef4444' ? 'red' : s.color === '#f97316' ? 'orange' : 'emerald'}-500/50`
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm text-white">{s.name}</span>
                                            <span className={`text-xs font-mono font-bold ${s.severity === 'Critical' ? 'text-red-400' :
                                                s.severity === 'Positive' ? 'text-emerald-400' : 'text-orange-400'
                                                }`}>
                                                {s.impact}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                                            {s.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: VISUALIZATION */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        {simulationData && activeScenario ? (
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold">Impact Analysis</h3>
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-cyan-500" />
                                            <span className="text-gray-400">Baseline</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeScenario.color }} />
                                            <span className="text-gray-400">{activeScenario.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-[300px] w-full bg-white/5 rounded-2xl p-4 border border-white/5 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={activeScenario.color} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={activeScenario.color} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#64748b", fontSize: 10 }}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#64748b", fontSize: 10 }}
                                                width={40}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                                itemStyle={{ fontSize: '12px' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="Baseline"
                                                stroke="#06b6d4"
                                                fillOpacity={1}
                                                fill="url(#colorBaseline)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey={activeScenario.name}
                                                stroke={activeScenario.color}
                                                fillOpacity={1}
                                                fill="url(#colorScenario)"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-400 text-center">
                                    Simulating 30-day impact based on current market coefficients.
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
                                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                <p>Accessing Neural Network...</p>
                            </div>
                        )}
                    </div>
                </div>
            </GlassModal>
        </main>
    );
}
