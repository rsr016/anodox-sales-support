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
  let peaks = props.data.map((d) => d.peak == 0 ? 0 : (d.service_grid > 0 ? 1 : -1));

  let bands = new Array();

  for (let i = 0; i < peaks.length; i++) {
    let curr = props.data[i];

    if (i == 0) {
      // Register starts, just in case
      if (peaks[i] == 1) {
        bands.push({ from: Date.parse(prev.timestamp) });
      } else if (peaks[i] == -1) {
        bands.push({ from: Date.parse(prev.timestamp) })
      }
    } else {
      let prev = props.data[i - 1]

      // Register ends
      if (peaks[i] != 1 && peaks[i - 1] == 1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.rose[100];
      } else if (peaks[i] != -1 && peaks[i - 1] == -1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.green[100];
      }

      // Register starts
      if (peaks[i] == 1 && peaks[i - 1] != 1) {
        bands.push({ from: Date.parse(prev.timestamp) });
      } else if (peaks[i] == -1 && peaks[i - 1] != -1) {
        bands.push({ from: Date.parse(prev.timestamp) })
      }
    }

    if (i == peaks.length - 1) {
      // Check last index to close final band
      if (peaks[i] == 1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.rose[100];
      } else if (peaks[i] == -1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.green[100];
      }
    }
  }
  return bands;
});

const bessEnergy = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(p.bess_energy.toFixed(2)) }));
});

const bessCharge = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(p.bess_net_charge.toFixed(2)) }));
});

const bessChargeLosses = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat((p.bess_net_charge - p.bess_gross_charge).toFixed(2)) }));
});

const bessDischarge = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat(-p.bess_net_discharge.toFixed(2)) }));
});

const bessDischargeLosses = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat((-p.bess_net_discharge + p.bess_gross_discharge).toFixed(2)) }));
});

const minSOC = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat((p.bess_min).toFixed(2)) }));
})

const maxSOC = computed(() => {
  return props.data.map((p, i) => ({ x: Date.parse(p.timestamp), y: parseFloat((p.bess_max).toFixed(2)) }));
})

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
      text: 'Fluxo de Energia BESS'
    },
    credits: {
      enabled: false
    },
    tooltip: {
      positioner: function () {
        return { x: 60, y: 230 };
      },
      style: {
        width: '250px'
      },
      valueSuffix: ' kWh',
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
          text: 'Energia kWh',
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
        yAxis: 0,
        name: 'Energia Armazenada',
        id: 'energia_armazenada',
        type: 'line',
        data: bessEnergy.value,
        marker: {
          enabled: false,
        },
        color: colors.blue[500]
      },
      {
        yAxis: 0,
        name: 'Máximo',
        id: 'max_energy',
        type: 'line',
        data: maxSOC.value,
        marker: {
          enabled: false,
        },
        dashStyle: 'Dot',
        color: colors.green[600]
      },
      {
        yAxis: 0,
        name: 'Carga',
        id: 'charge_bess',
        type: 'area',
        data: bessCharge.value,
        marker: {
          enabled: false
        },
        color: colors.green[600]
      },

      {
        yAxis: 0,
        name: 'Descarga',
        id: 'discharge_bess',
        type: 'area',
        data: bessDischarge.value,
        stacking: 'normal',
        marker: {
          enabled: false
        },
        fillOpacity: 0.3,
        color: colors.red[600]
      },
      {
        yAxis: 0,
        name: 'Mínimo',
        id: 'min_energy',
        type: 'line',
        data: minSOC.value,
        marker: {
          enabled: false,
        },
        dashStyle: 'Dot',
        color: colors.orange[600]
      },
    ]
  }
});

</script>

<style></style>
