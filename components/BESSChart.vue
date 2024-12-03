<template>
  <div>
    <highchart :options="options" class="border rounded-lg" :update="['options']" :redraw="true"/>
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

const peakBands = computed(function(){
  let bands = new Array();
  for (let i = 0; i < props.data.length; i++) {
    if (i > 0) {
      if (props.data[i].peak > 0 && props.data[i - 1].peak == 0) {
        bands.push({from: Date.parse(props.data[i].timestamp)});
      } else if (props.data[i].peak == 0 && props.data[i - 1].peak > 0) {
        bands[bands.length - 1].to = Date.parse(props.data[i - 1].timestamp)
        bands[bands.length - 1].color = '#FFEFFF'
      }
    }
  };
  return bands;
});

const bessEnergy = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: p.bess_energy}));
});

const bessCharge = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: p.bess_net_charge}));
});

const bessDischarge = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: -p.bess_net_discharge}));
});

const options = computed(() => { return{
  cycles: 0,
  chart: {
    type: 'area',
    scrollablePlotArea: {
      minWidth: 700,
      scrollPositionX: 1
    }
  },
  xAxis: {
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
    style: {
      width: '250px'
    }
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
        text: 'Energia kW',
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
      lineWidth: 0.8,
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
      tooltip: {
        xDateFormat: '%H:%M %B %e, %Y',
        valueSuffix: ' kWh'
      },
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
      tooltip: {
        headerFormat:
          '<span style="font-size: 11px;color:#666">{point.x:%B %e,' +
          ' %Y}</span><br>',
        pointFormat: '{point.name}<br><b>{point.y}</b>',
        valueSuffix: ' kWh'
      },
      data: bessCharge.value,
      marker: {
        enabled: false
      },
      color: colors.green[200]
    },

    {
      yAxis: 0,
      name: 'Decarga',
      id: 'discharge_bess',
      type: 'area',
      data: bessDischarge.value,
      tooltip: {
        xDateFormat: '%H:%M %B %e, %Y',
        valueSuffix: ' kWh'
      },
      stacking: 'normal',
      marker: {
        enabled: false
      },
      fillOpacity: 0.3,
      color: colors.red[600]
    }
  ]
}});

</script>

<style></style>
