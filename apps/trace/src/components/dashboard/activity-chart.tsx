'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ActivityMetrics } from '@/lib/mock-data';
import {
  chartColors,
  chartTheme,
  numberTooltipFormatter,
  dateTooltipFormatter,
  compactNumberFormatter,
} from '@/lib/utils/chart-config';

export interface ActivityChartProps {
  data: ActivityMetrics[];
  metrics?: ('dau' | 'wau' | 'mau')[];
  height?: number;
}

export function ActivityChart({
  data,
  metrics = ['dau', 'wau', 'mau'],
  height = 350,
}: ActivityChartProps) {
  // Metric configuration
  const metricConfig = {
    dau: {
      label: 'DAU',
      color: chartColors.dau,
    },
    wau: {
      label: 'WAU',
      color: chartColors.wau,
    },
    mau: {
      label: 'MAU',
      color: chartColors.mau,
    },
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Activity Metrics
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray={chartTheme.grid.strokeDasharray}
            stroke={chartTheme.grid.stroke}
          />
          <XAxis
            dataKey="date"
            tickFormatter={dateTooltipFormatter}
            stroke={chartTheme.axis.stroke}
            style={{
              fontSize: chartTheme.axis.fontSize,
              fontFamily: chartTheme.axis.fontFamily,
            }}
          />
          <YAxis
            tickFormatter={compactNumberFormatter}
            stroke={chartTheme.axis.stroke}
            style={{
              fontSize: chartTheme.axis.fontSize,
              fontFamily: chartTheme.axis.fontFamily,
            }}
          />
          <Tooltip
            contentStyle={chartTheme.tooltip.contentStyle}
            labelStyle={chartTheme.tooltip.labelStyle}
            itemStyle={chartTheme.tooltip.itemStyle}
            labelFormatter={dateTooltipFormatter}
            formatter={numberTooltipFormatter}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          {metrics.includes('dau') && (
            <Line
              type="monotone"
              dataKey="dau"
              name={metricConfig.dau.label}
              stroke={metricConfig.dau.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
          {metrics.includes('wau') && (
            <Line
              type="monotone"
              dataKey="wau"
              name={metricConfig.wau.label}
              stroke={metricConfig.wau.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
          {metrics.includes('mau') && (
            <Line
              type="monotone"
              dataKey="mau"
              name={metricConfig.mau.label}
              stroke={metricConfig.mau.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
