
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassPrimitives';
import { motion } from 'framer-motion';

interface StockData {
    ticker: string;
    meta: {
        current_price: number;
        change_pct: number;
        currency: string;
        name: string;
    };
    data: { date: string; value: number }[];
}

export const StockChart = ({ stock }: { stock: StockData }) => {
    if (!stock) return null;

    const isPositive = stock.meta.change_pct >= 0;
    const color = isPositive ? "#10b981" : "#ef4444"; // Emerald or Red

    return (
        <GlassCard className="w-full max-w-md mx-auto !p-6 border-t-4" style={{ borderColor: color }}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">{stock.meta.name}</h3>
                    <div className="text-4xl font-mono font-bold text-white mt-1">
                        ${stock.meta.current_price.toFixed(2)}
                    </div>
                </div>
                <div className={`text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="text-lg font-bold">{stock.ticker}</div>
                    <div className="text-sm font-mono bg-white/10 px-2 py-1 rounded">
                        {isPositive ? '+' : ''}{stock.meta.change_pct}%
                    </div>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stock.data}>
                        <defs>
                            <linearGradient id={`gradient-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            hide
                        />
                        <YAxis
                            hide
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#gradient-${stock.ticker})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between mt-4 text-xs text-gray-500">
                <span>{stock.data[0]?.date}</span>
                <span>{stock.data[stock.data.length - 1]?.date}</span>
            </div>
        </GlassCard>
    );
};
