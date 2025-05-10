
"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps {
  data: any;
  className?: string;
}

export function LineChart({ data, className }: ChartProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data?.datasets ? [] : data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data?.datasets ? (
            data.datasets.map((dataset: any, index: number) => (
              <Line
                key={index}
                type="monotone"
                dataKey={dataset.label}
                data={data.labels.map((label: string, i: number) => ({
                  name: label,
                  [dataset.label]: dataset.data[i],
                }))}
                stroke={dataset.borderColor}
                fill={dataset.backgroundColor}
                activeDot={{ r: 8 }}
              />
            ))
          ) : (
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({ data, className }: ChartProps) {
  if (!data) return null;

  // If the data is in Chart.js format, convert it to a format that recharts can use
  const formattedData = data.labels
    ? data.labels.map((label: string, index: number) => {
        const entry: Record<string, any> = { name: label };
        data.datasets.forEach((dataset: any) => {
          entry[dataset.label] = dataset.data[index];
        });
        return entry;
      })
    : data;

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.datasets
            ? data.datasets.map((dataset: any, index: number) => (
                <Bar
                  key={index}
                  dataKey={dataset.label}
                  fill={dataset.backgroundColor || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                />
              ))
            : Object.keys(formattedData[0] || {})
                .filter((key) => key !== "name")
                .map((key, index) => (
                  <Bar
                    key={index}
                    dataKey={key}
                    fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                  />
                ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({ data, className }: ChartProps) {
  if (!data || !data.datasets) return null;

  const dataset = data.datasets[0];
  const formattedData = data.labels.map((label: string, index: number) => ({
    name: label,
    value: dataset.data[index],
  }));
  
  const COLORS = dataset.backgroundColor || [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#83a6ed",
  ];

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {formattedData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
