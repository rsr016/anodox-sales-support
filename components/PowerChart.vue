<template>
  <div class="mt-5">
    <p class="font-bold">Sales over time</p>
    <div class="bg-background mt-5 md:p-3 border rounded-lg h-[300px]">
      <Line :data="data" :options="options" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
    type ChartData,
  } from "chart.js";
  import { Line } from "vue-chartjs";
  import colors from "#tailwind-config/theme/colors";

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

  const mode = useColorMode();

  const options = computed<ChartOptions<"line">>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          intersect: false,
        },
      },
      scales: {
        y: {
          grid: {
            color: mode.value === "dark" ? colors.slate[900] : colors.slate[200],
          },
          ticks: {
            color: colors.slate[500],
          },
        },
        x: {
          grid: {
            color: mode.value === "dark" ? colors.slate[800] : colors.slate[200],
          },
          ticks: {
            color: colors.slate[500],
          },
        },
      },
    };
  });

  const data = ref<ChartData<"line">>({
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sales over time",
        backgroundColor: colors.background,
        tension: 0.4,
        borderColor: colors.blue[500],
        borderWidth: 2,
        pointBackgroundColor: colors.blue[500],
        data: [40, 39, 10, 40, 39, 80, 40],
      },
      {
        label: "Other over time",
        backgroundColor: colors.background,
        tension: 0.4,
        borderColor: colors.green[500],
        borderWidth: 2,
        pointBackgroundColor: colors.green[500],
        data: [20, 30, 19, 22, 48, 60, 50],
      }
    ],
  });
  
</script>