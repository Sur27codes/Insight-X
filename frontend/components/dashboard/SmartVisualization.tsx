
import React, { useState, useEffect } from 'react';
import { DynamicChart, ChartType } from './DynamicChart';
import { DetailedAnalysisPanel } from './DetailedAnalysisPanel';
import { GlassButton } from '@/components/ui/GlassPrimitives';
import { AnimatePresence, motion } from 'framer-motion';

interface SmartVizProps {
    data: any[];
    analysis: any; // analysis has detailed info
    metrics?: any;
}

export const SmartVisualization = ({ data, analysis, metrics }: SmartVizProps) => {
    const [activeChartType, setActiveChartType] = useState<ChartType>('area');
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (analysis?.recommended_viz) {
            // Map backend viz types to our ChartType
            const map: Record<string, ChartType> = {
                'line': 'line',
                'bar': 'bar',
                'area': 'area',
                'composed': 'composed'
            };
            setActiveChartType(map[analysis.recommended_viz] || 'area');
        }
    }, [analysis]);

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-6 pl-2 pr-2">
                <div className="flex gap-2">
                    {['area', 'line', 'bar'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveChartType(type as ChartType)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeChartType === type
                                ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    {analysis?.precautions?.length > 0 && (
                        <div className="group relative">
                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full cursor-help border border-yellow-500/20 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                Precautions
                            </span>
                            <div className="absolute right-0 top-8 w-64 bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl z-50 hidden group-hover:block backdrop-blur-md">
                                <ul className="list-disc list-inside text-xs text-gray-300 space-y-2">
                                    {analysis.precautions.map((p: string, i: number) => (
                                        <li key={i}>{p}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <GlassButton
                        onClick={() => setShowDetails(true)}
                        className="!py-1 !px-3 !text-xs !h-auto flex items-center gap-2"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Deep Dive
                    </GlassButton>
                </div>
            </div>

            {/* Narrative Insights Bar */}
            {analysis?.insights?.length > 0 && (
                <div className="mb-4 p-3 bg-white/5 border border-white/5 rounded-lg flex flex-wrap gap-4 items-center">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-2 border-r border-white/10">
                        Top Insights
                    </span>
                    {analysis.insights.slice(0, 2).map((insight: string, i: number) => (
                        <span key={i} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-cyan-500" />
                            {insight}
                        </span>
                    ))}
                    {analysis.insights.length > 2 && (
                        <span className="text-xs text-gray-500 italic">+{analysis.insights.length - 2} more in Deep Dive</span>
                    )}
                </div>
            )}

            <div className="flex-1 min-h-[400px]">
                <DynamicChart
                    data={data}
                    type={activeChartType}
                    dataKeys={{
                        x: 'date',
                        y: 'value',
                        confidence: ['confidence_lower', 'confidence_upper']
                    }}
                    colors={{
                        primary: '#06b6d4',
                        secondary: '#8b5cf6'
                    }}
                />
            </div>

            <AnimatePresence>
                {showDetails && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetails(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />
                        <DetailedAnalysisPanel
                            metrics={metrics}
                            analysis={analysis}
                            onClose={() => setShowDetails(false)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
