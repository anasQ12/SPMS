import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#4F46E5', '#f97316', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

// ── ProgressLineChart ─────────────────────────────────────────────────────────
export const ProgressLineChart: React.FC<{
  data: { week: string; score: number }[];
  height?: number;
}> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
      <Tooltip
        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
      />
      <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
    </LineChart>
  </ResponsiveContainer>
);

// ── EvaluationBarChart ────────────────────────────────────────────────────────
export const EvaluationBarChart: React.FC<{
  data: { name: string; score: number }[];
  height?: number;
}> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
      <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// ── GoalCompletionChart ───────────────────────────────────────────────────────
export const GoalCompletionChart: React.FC<{
  data: { name: string; value: number }[];
  height?: number;
}> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
      <Legend iconSize={10} iconType="circle" formatter={(value) => <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>} />
    </PieChart>
  </ResponsiveContainer>
);

// ── ProgramTrendChart ─────────────────────────────────────────────────────────
export const ProgramTrendChart: React.FC<{
  data: { week: string; students: number; average: number }[];
  height?: number;
}> = ({ data, height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} />
      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
      <Legend />
      <Line type="monotone" dataKey="average" name="Avg Score" stroke="#4F46E5" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="students" name="Students" stroke="#f97316" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ── RiskPieChart ──────────────────────────────────────────────────────────────
export const RiskPieChart: React.FC<{
  safe: number; warning: number; risk: number; height?: number;
}> = ({ safe, warning, risk, height = 180 }) => {
  const data = [
    { name: 'On Track', value: safe },
    { name: 'Attention', value: warning },
    { name: 'At Risk', value: risk },
  ].filter((d) => d.value > 0);
  const colors = ['#22c55e', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend iconSize={10} iconType="circle" formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ── InstructorPerformanceChart ────────────────────────────────────────────────
export const InstructorPerformanceChart: React.FC<{
  data: { name: string; avg: number; students: number }[];
  height?: number;
}> = ({ data, height = 220 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
      <Bar dataKey="avg" name="Avg Score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
