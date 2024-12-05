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
  let bands = new Array();
  for (let i = 0; i < props.data.length; i++) {
    if (i > 0) {
      let curr = props.data[i];
      let prev = props.data[i - 1]
      if (curr.peak > 0 && prev.peak == 0) {
        bands.push({ from: Date.parse(curr.timestamp) });
      } else if (curr.peak == 0 && prev.peak > 0) {
        bands[bands.length - 1].to = Date.parse(prev.timestamp)
        bands[bands.length - 1].color = '#FFEFFF'
      }
    }
  };
  return bands;
});


const peakBands2 = computed(function () {
  let bands = {
    attended: new Array(),
    unnatended: new Array()
  }
  for (let i = 0; i < props.data.length; i++) {
    if (i > 0) {
      let curr = props.data[i];
      let prev = props.data[i - 1]

      if (curr.peak > 0 && prev.peak == 0) {
        if (curr.service_grid - curr.service_from_bess > 0) {
          bands.unnatended.push({ from: Date.parse(curr.timestamp) })
        } else {
          bands.attended.push({ from: Date.parse(curr.timestamp) });
        }

      } else if (curr.peak == 0 && prev.peak > 0) {
        if (prev.service_grid - prev.service_from_bess > 0) {
          bands.unnatended[bands.unnatended.length - 1].to = Date.parse(prev.timestamp);
          bands.unnatended[bands.unnatended.length - 1].color = '#FFEFFF';
        } else {
          bands.attended[bands.attended.length - 1].to = Date.parse(prev.timestamp);
          bands.attended[bands.attended.length - 1].color = '#d1d1d1';
        }

      }
    }
  };
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
        color: colors.blue[300]
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
        color: colors.green[200]
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
      }
    ]
  }
});

</script>

<style></style>
