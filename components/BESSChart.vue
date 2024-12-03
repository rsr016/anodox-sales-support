<template>
  <div>
    <highchart :options="options" class="border rounded-lg" :update="['options']"/>
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

const powerOriginal = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: p.aggregate}));
});

const powerFromGrid = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: p.service_grid}));
});

const powerToBESS = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: p.service_to_bess}));
});

const powerFromBESS = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: -p.service_from_bess}));
});

const powerLimit = computed(() => {
  return props.data.map((p, i) => ({x: Date.parse(p.timestamp), y: p.contracted}));
});

const options = {
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
    text: 'Demanda requisitada da rede'
  },
  caption: {
    text: 'Perfil de consumo da rede'
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
        xDateFormat: '%H:%M %B %e, %Y',
        valueSuffix: ' kW'
      },
      marker: {
        enabled: false,
      },
      color: colors.slate[300]
    },
    {
      name: 'Demanda Contratada',
      id: 'power',
      type: 'line',
      tooltip: {
        headerFormat:
          '<span style="font-size: 11px;color:#666">{point.x:%B %e,' +
          ' %Y}</span><br>',
        pointFormat: '{point.name}<br><b>{point.y}</b>',
        valueSuffix: ' kW'
      },
      data: powerLimit.value,
      marker: {
        enabled: false
      },
      color: colors.gray[200]
    },

    {
      name: 'Carga BESS',
      id: 'charge_bess',
      type: 'area',
      data: powerToBESS.value,
      tooltip: {
        xDateFormat: '%H:%M %B %e, %Y',
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
        xDateFormat: '%H:%M %B %e, %Y',
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
        xDateFormat: '%H:%M %B %e, %Y',
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
};


</script>

<style></style>
