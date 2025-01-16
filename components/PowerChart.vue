<template>
  <div>
    <highchart :options="options" class="border rounded-lg" :update="['options']" :redraw="true" />
  </div>
</template>

<script setup>

import colors from "#tailwind-config/theme/colors";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const peakBands = computed(function () {
  return findPeaks(props.data);
});

const powerOriginal = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(p.power_cons_total.toFixed(2)) }));
});

const powerFromGrid = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat((p.power_cons_total -p.service_from_bess).toFixed(2)) }));
});

const powerToBESS = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(p.service_to_bess.toFixed(2)) }));
});

const powerFromBESS = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(-p.service_from_bess.toFixed(2)) }));
});

const powerLimit = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(p.contracted.toFixed(2)) }));
});

const options = computed(() => {
  return {
    cycles: 0,
    chart: {
      type: 'area',
      scrollablePlotArea: {
        minWidth: 700,
        scrollPositionX: 1
      }
    },
    xAxis: {
      crosshair: true,
      type: 'datetime',
      minTickInterval: 365 * 24 * 36e5,
      labels: {
        align: 'left'
      },
      plotBands: peakBands.value,
    },
    title: {
      text: 'Demanda requisitada da rede'
    },
    credits: {
      enabled: false
    },
    tooltip: {
      positioner: function () {
        return { x: 60, y: 200 };
      },
      style: {
        width: '250px',
      },
      shared: true
    },
    yAxis: [
      {
        // min: 0,
        labels: {
          enabled: true
        },
        title: {
          text: ''
        },
        gridLineColor: 'rgba(0, 0, 0, 0.07)'
      },
      {
        allowDecimals: false,
        labels: {
          style: {
            color: colors.slate[900]
          }
        },
        title: {
          text: 'Demanda kW',
          style: {
            color: colors.slate[900]
          }
        },
        opposite: true,
        gridLineWidth: 0
      }
    ],
    plotOptions: {
      area: {
        stacking: 'normal',
        lineWidth: 0.8,
      },
      line: {
        lineWidth: 1.5,
      },
      flags: {
        tooltip: {
          xDateFormat: '%HH:%mm %B %e, %Y'
        },
        accessibility: {
          point: {
            valueDescriptionFormat:
              '{xDescription}. {point.title}: {point.text}.'
          }
        }
      },
    },
    series: [
      {
        name: 'Consumo original',
        id: 'consumo_original',
        type: 'line',
        data: powerOriginal.value,
        tooltip: {
          valueSuffix: ' kW'
        },
        marker: {
          enabled: false,
        },
        color: colors.slate[700]
      },
      {
        name: 'Demanda Contratada',
        id: 'power',
        type: 'line',
        tooltip: {
          valueSuffix: ' kW'
        },
        data: powerLimit.value,
        marker: {
          enabled: false
        },
        dashStyle: 'Dot',
        color: colors.orange[400]
      },

      {
        name: 'Carga BESS',
        id: 'charge_bess',
        type: 'area',
        data: powerToBESS.value,
        tooltip: {
          valueSuffix: ' kW'
        },
        stacking: 'normal',
        marker: {
          enabled: false
        },
        fillOpacity: 0.3,
        color: colors.orange[600]
      },
      {
        name: 'Descarga BESS',
        id: 'discharge_bess',
        type: 'area',
        data: powerFromBESS.value,
        tooltip: {
          valueSuffix: ' kW'
        },
        stacking: 'normal',
        marker: {
          enabled: false
        },
        fillOpacity: 0.3,
        color: colors.green[600]
      },

      {
        name: 'Consumo Novo',
        id: 'consumo_novo',
        type: 'area',
        data: powerFromGrid.value,
        tooltip: {
          valueSuffix: ' kW'
        },
        stacking: 'normal',
        marker: {
          enabled: false
        },
        fillOpacity: 0.3,
        color: colors.blue[400]
      }

    ]
  }
});

</script>

<style></style>
