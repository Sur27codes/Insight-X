"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

const defaultData = [
    { subject: 'Accuracy', A: 95, fullMark: 100 },
    { subject: 'Speed', A: 88, fullMark: 100 },
    { subject: 'Stability', A: 92, fullMark: 100 },
    { subject: 'Data Quality', A: 85, fullMark: 100 },
    { subject: 'Resilience', A: 80, fullMark: 100 },
];

export const ModelRadar = ({ data = defaultData }: { data?: any[] }) => {
    return (
        <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Model Health"
                        dataKey="A"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="#06b6d4"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
            <div className="absolute top-0 right-0 text-[10px] text-cyan-400 font-mono border border-cyan-500/20 px-2 py-1 rounded bg-cyan-900/10 backdrop-blur-md">
                RADAR ACTIVE
            </div>
        </div>
    );
};
