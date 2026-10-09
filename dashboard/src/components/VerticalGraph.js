import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const buildOptions = (title) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: Boolean(title),
      text: title,
      align: "start",
      color: "#3a3a3a",
      font: { size: 14, weight: "500" },
      padding: { bottom: 16 },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#f1f1f1" }, border: { display: false } },
  },
});

export function VerticalGraph({ data, title = "Holdings" }) {
  return <Bar options={buildOptions(title)} data={data} />;
}
