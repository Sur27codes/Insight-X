"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassPrimitives';

interface DetailedAnalysisPanelProps {
    metrics: {
        growth?: string;
        seasonality?: string;
        volatility?: string;
        forecast_accuracy?: string;
        mean?: number;
        median?: number;
        std_dev?: number;
        min?: number;
        max?: number;
        total?: number;
    } | null;
    analysis: {
        precautions?: string[];
        recommendations?: string[];
        anomalies?: Array<{ date: string, value: number, reason: string }>;
        decomposition?: {
            trend: number[];
            seasonal: number[];
            residual: number[];
        };
    } | null;
    onClose: () => void;
}

export const DetailedAnalysisPanel = ({ metrics, analysis, onClose }: DetailedAnalysisPanelProps) => {
    if (!metrics && !analysis) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-y-0 right-0 w-[400px] bg-slate-950/90 backdrop-blur-xl border-l border-white/10 p-6 z-50 shadow-2xl overflow-y-auto"
        >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white">Deep Dive Analysis</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Metrics Section */}
            {metrics && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">Statistical Vitals</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(metrics).map(([key, value]) => (
                            <div key={key} className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-xs text-gray-400 block mb-1 capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-md font-mono text-white font-bold">
                                    {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Anomalies Section */}
            {analysis?.anomalies && analysis.anomalies.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4">Detected Anomalies</h3>
                    <div className="space-y-3">
                        {analysis.anomalies.map((a, i) => (
                            <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex justify-between text-white text-sm font-bold mb-1">
                                    <span>{a.date}</span>
                                    <span className="text-red-300">{a.value.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-gray-400">{a.reason || "Statistical deviation detected."}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Strategic Advice</h3>
                    <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-300">
                                <span className="text-emerald-500 mt-1">✓</span>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Precautions */}
            {analysis?.precautions && analysis.precautions.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4">Risk Factors</h3>
                    <ul className="space-y-2">
                        {analysis.precautions.map((p, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-300">
                                <span className="text-yellow-500 mt-1">!</span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
};
