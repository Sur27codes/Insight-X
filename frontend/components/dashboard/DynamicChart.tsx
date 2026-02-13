"use client";

import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    ComposedChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
    Cell,
    Brush
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export type ChartType = 'area' | 'bar' | 'line' | 'composed';

interface DynamicChartProps {
    data: any[];
    type?: ChartType;
    dataKeys: {
        x: string;
        y: string; // Primary value
        y2?: string; // Secondary value (e.g. comparison)
        confidence?: [string, string]; // [lower, upper]
    };
    colors?: {
        primary: string;
        secondary?: string;
        tertiary?: string;
    };
    height?: number | string;
    showLegend?: boolean;
    showGrid?: boolean;
    animate?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md p-4 shadow-2xl ring-1 ring-white/5">
                <p className="mb-3 text-sm font-bold text-white border-b border-white/5 pb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                    style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
                                />
                                <span className="text-gray-300 font-medium">{entry.name}</span>
                            </div>
                            <span className="font-mono font-bold text-white tabular-nums">
                                {Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export const DynamicChart = ({
    data,
    type = 'area',
    dataKeys,
    colors = { primary: "#06b6d4", secondary: "#8b5cf6", tertiary: "#10b981" },
    height = 400,
    showLegend = true,
    showGrid = true,
    animate = true
}: DynamicChartProps) => {

    const renderChartUpdated = () => {
        const commonProps = {
            data: data,
            margin: { top: 20, right: 30, left: 0, bottom: 0 },
        };

        const grid = showGrid && (
            <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
            />
        );

        const formatXAxisResult = (val: string) => {
            // Try to parse standard dates
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
            }
            return val;
        };

        const axes = (
            <>
                <XAxis
                    dataKey={dataKeys.x}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                    dy={10}
                    minTickGap={50}
                    tickFormatter={formatXAxisResult}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                    domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                {showLegend && (
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', opacity: 0.7 }}
                        // Filter out confidence intervals from the legend
                        payload={
                            [
                                { value: 'Primary Value', type: 'circle', id: dataKeys.y, color: colors.primary },
                                dataKeys.y2 ? { value: 'Comparison', type: 'circle', id: dataKeys.y2, color: colors.secondary } : null
                            ].filter(Boolean) as any[]
                        }
                    />
                )}
            </>
        );

        const defs = (
            <defs>
                <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={colors.secondary} stopOpacity={0} />
                </linearGradient>
            </defs>
        );

        switch (type) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        {defs}
                        {grid}
                        {axes}
                        <Bar
                            dataKey={dataKeys.y}
                            fill={`url(#colorPrimary)`}
                            stroke={colors.primary}
                            radius={[4, 4, 0, 0]}
                            animationDuration={animate ? 1500 : 0}
                        />
                        {dataKeys.y2 && (
                            <Bar
                                dataKey={dataKeys.y2}
                                fill={`url(#colorSecondary)`}
                                stroke={colors.secondary}
                                radius={[4, 4, 0, 0]}
                                animationDuration={animate ? 1500 : 0}
                            />
                        )}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        {defs}
                        {grid}
                        {axes}
                        <Line
                            type="monotone"
                            dataKey={dataKeys.y}
                            stroke={colors.primary}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                            animationDuration={animate ? 1500 : 0}
                        />
                        {dataKeys.y2 && (
                            <Line
                                type="monotone"
                                dataKey={dataKeys.y2}
                                stroke={colors.secondary}
                                strokeWidth={3}
                                dot={false}
                                strokeDasharray="5 5"
                                animationDuration={animate ? 1500 : 0}
                            />
                        )}
                    </LineChart>
                );
            case 'composed':
                return (
                    <ComposedChart {...commonProps}>
                        {defs}
                        {grid}
                        {axes}
                        {dataKeys.confidence && (
                            <Area
                                type="monotone"
                                dataKey={dataKeys.confidence[1]} // Upper
                                stroke="none"
                                fill={colors.primary}
                                fillOpacity={0.1}
                            />
                        )}
                        {dataKeys.confidence && (
                            <Area
                                type="monotone"
                                dataKey={dataKeys.confidence[0]} // Lower
                                stroke="none"
                                fill={colors.primary}
                                fillOpacity={0.1}
                            />
                        )}

                        <Area
                            type="monotone"
                            dataKey={dataKeys.y}
                            fill={`url(#colorPrimary)`}
                            stroke={colors.primary}
                            strokeWidth={3}
                            animationDuration={animate ? 1500 : 0}
                        />
                        {dataKeys.y2 && (
                            <Line
                                type="monotone"
                                dataKey={dataKeys.y2}
                                stroke={colors.secondary}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 0, fill: colors.secondary }}
                                animationDuration={animate ? 1500 : 0}
                            />
                        )}
                    </ComposedChart>
                );
            case 'area':
            default:
                return (
                    <AreaChart {...commonProps}>
                        {defs}
                        {grid}
                        {axes}
                        <Area
                            type="monotone"
                            dataKey={dataKeys.confidence[1]}
                            stroke="none"
                            fill={colors.primary}
                            fillOpacity={0.05}
                            animationDuration={0}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKeys.y}
                            fill={`url(#colorPrimary)`}
                            stroke={colors.primary}
                            strokeWidth={3}
                            animationDuration={animate ? 1500 : 0}
                        />
                        {dataKeys.y2 && (
                            <Area
                                type="monotone"
                                dataKey={dataKeys.y2}
                                fill={`url(#colorSecondary)`}
                                stroke={colors.secondary}
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                animationDuration={animate ? 1500 : 0}
                            />
                        )}
                        <Brush
                            dataKey={dataKeys.x}
                            height={30}
                            stroke="#334155"
                            fill="#0f172a"
                            tickFormatter={formatXAxisResult}
                        />
                    </AreaChart>
                );
        }
    };

    // Calculate SMA if smoothing is enabled
    // We can wrap this in useMemo if needed, but for now let's keep it simple or assume data is passed pre-smoothed?
    // Actually, let's keep the chart component pure and handling Zoom (Brush) first.
    // Smoothing is better handled by passing a "smoothedData" prop or transforming it here.

    return (
        <div style={{ height }} className="relative group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChartUpdated()}
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
