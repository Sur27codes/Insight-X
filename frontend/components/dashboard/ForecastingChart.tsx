"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
    ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-slate-900 p-4 shadow-xl">
                <p className="mb-2 text-sm font-semibold text-white">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-300">{entry.name}:</span>
                        <span className="font-mono font-bold text-white">
                            {Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const AnomalyDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isAnomaly) {
        return (
            <circle cx={cx} cy={cy} r={6} fill="#FF4B4B" stroke="#fff" strokeWidth={2} />
        );
    }
    return null;
};

export const ForecastingChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-glass-border bg-glass-100/50 p-4">
                <p className="text-gray-400">No data available for forecasting</p>
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full rounded-lg border border-glass-border bg-glass-100/50 p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#00E0FF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818CF8" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#818CF8" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#FFFFFF", fontSize: 13, fontWeight: 700 }}
                        dx={-10}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }} />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: '#E2E8F0', opacity: 0.8 }}
                    />
                    <ReferenceLine y={3500} stroke="#10B981" strokeDasharray="3 3" label={{ value: "Target", fill: "#10B981", fontSize: 11, position: 'right' }} />

                    <Area
                        type="monotone"
                        dataKey="confidence_upper"
                        stroke="none"
                        fill="url(#colorConfidence)"
                        legendType="none"
                    />
                    <Area
                        type="monotone"
                        dataKey="confidence_lower"
                        stroke="none"
                        fill="rgba(2, 6, 23, 1)"
                        legendType="none"
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        name="Baseline Forecast"
                        stroke="#00E0FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        dot={<AnomalyDot />}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                    />
                    {data[0]?.scenarioValue !== undefined && (
                        <Area
                            type="monotone"
                            dataKey="scenarioValue"
                            name="Scenario Simulation"
                            stroke="#FBBF24"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScenario)"
                            strokeDasharray="5 5"
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
