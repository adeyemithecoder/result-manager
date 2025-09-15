// components/GenderPieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const GenderPieChart = ({ maleCount, femaleCount }) => {
  const data = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Number of Students",
        data: [maleCount, femaleCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#FFFFFF", // Change the color to white
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const currentValue = dataset.data[tooltipItem.dataIndex];
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        formatter: (value, context) => {
          const dataset = context.chart.data.datasets[0];
          const total = dataset.data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${
            context.chart.data.labels[context.dataIndex]
          }: ${value} (${percentage}%)`;
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default GenderPieChart;
