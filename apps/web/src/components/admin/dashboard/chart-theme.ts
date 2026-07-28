import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Validated categorical slots (dataviz skill reference palette), not the
// brand primary — the brand blue's lightness falls outside the safe band.
export const CHART_COLORS = {
  series1: '#2a78d6', // blue
  series2: '#eb6834', // orange
  series3: '#1baf7a', // aqua
};

const GRID_COLOR = '#e1e6ed'; // matches --color-border
const TEXT_COLOR = '#57657c'; // matches --color-muted-foreground

export const baseBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: { color: TEXT_COLOR, font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: '#0c1b33',
      padding: 8,
      cornerRadius: 6,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: TEXT_COLOR, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: GRID_COLOR },
      ticks: { color: TEXT_COLOR, font: { size: 11 } },
    },
  },
};
