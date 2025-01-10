<template>
  <div class='lg:mx-36 mb-6'>
    <UTable :rows="rows" :columns="columns" :ui="TableConfig" class=''>
      <template #old-data="{ row }">
        <p class="justify-self-end">
          {{ row.old_value == 0 ? '-' : 'R$ ' + formatNum(row.old_value) }}
        </p>
        <p class="justify-self-end text-slate-300 text-sm" v-if="row.old">
          {{ row.old == 0 ? '-' : formatNum(row.old) }}
        </p>
      </template>
      <template #new-data="{ row }">
        <p class="justify-self-end">
          {{ row.new_value == 0 ? '-' : 'R$ ' + formatNum(row.new_value) }}
        </p>
        <p class="justify-self-end text-slate-300 text-sm" v-if="row.new">
          {{ row.new == 0 ? '-' : formatNum(row.new) }}
        </p>
      </template>
      <template #saving-data="{ row }">
        <p :class="'justify-self-end ' + (row.saving < 0 ? 'text-green-500' : 'text-red-700')">
          {{ row.saving == 0 ? '-' : 'R$ ' + formatNum(row.saving) }}
        </p>
        <p class="justify-self-end text-slate-300 text-sm" v-if="row.new || row.old">
          {{ row.new - row.old == 0 ? '-' : formatNum(row.new - row.old) }}
        </p>
      </template>
    </UTable>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

const props = defineProps({
  performance: {
    type: Array,
    required: true,
  },
  project: {
    type: Object,
    required: true,
  }
});

const TableConfig = {
  base: 'justify-self-center place-content-center  my-3 table-auto',
  divide: 'divide-y divide-gray-300 dark:divide-gray-700',
  th: {
    // base: 'hidden'
  },
  td: {
    base: 'justify-self-center',
    class: 'justify-self-center',
    padding: 'px-6 py-1',
    color: 'text-gray-600 dark:text-gray-400',
  },
  tr: {
    base: 'hover:bg-slate-200',
  }
}

const columns = [
  {
    key: 'item',
    label: 'Item',
  },
  {
    key: 'old',
    label: 'Base',
  },
  {
    key: 'new',
    label: 'Com BESS'
  },
  {
    key: 'saving',
    label: 'Economia'
  }
];


const rows = computed(() => {
  let perf = props.performance;
  let proj = props.project;

  let data = {
    demand: {
      item: 'Demanda (kW)',
      old: Math.max.apply(Math, perf.map((x) => x.aggregate)),
      new: Math.max.apply(Math, perf.map((x) => x.service_grid)),
    },
    surcharge: {
      item: 'Ultrapassagem (kW)',
      old: Math.max.apply(Math, perf.map((x) => x.aggregate)) - proj.contracted_demand,
      new: Math.max.apply(Math, perf.map((x) => x.service_grid)) - proj.contracted_demand,
    },
    offpeaktusd: {
      item: 'TUSD Fora Ponta (kWh)',
      old: perf.reduce(function (acc, cur) { return acc + cur.off_peak }, 0) / 4,
      new: perf.reduce(function (acc, cur) { return acc + (cur.off_peak > 0 ? cur.off_peak + cur.service_to_bess - cur.service_from_bess : 0) }, 0) / 4,
    },
    peaktusd: {
      item: 'TUSD Ponta (kWh)',
      old: perf.reduce(function (acc, cur) { return acc + cur.peak }, 0) / 4,
      new: perf.reduce(function (acc, cur) { return acc + (cur.peak > 0 ? cur.peak + cur.service_to_bess - cur.service_from_bess : 0) }, 0) / 4,
    }
  }

  data.surcharge = {
    item: 'Ultrapassagem (kW)',
    old: data.demand.old - proj.contracted_demand,
    new: data.demand.new - proj.contracted_demand,
  }
  data.energy = {
    item: 'Energia Adicional (kWh)',
    old: 0,
    new: data.peaktusd.new + data.offpeaktusd.new - data.peaktusd.old - data.offpeaktusd.old,
  }
  
  Object.keys(data).forEach((k) => {
    data[k].old_value = data[k].old * proj['bill_tar_' + k];
    data[k].new_value = data[k].new * proj['bill_tar_' + k];
    data[k].saving = data[k].new_value - data[k].old_value;
  })

  data.subvention = {
    item: 'Subvenção (R$)',
    old_value: data.demand.old * proj.bill_subvention_demand + data.peaktusd.old * proj.bill_subvention_tusd,
    new_value: data.demand.new * proj.bill_subvention_demand + data.peaktusd.new * proj.bill_subvention_tusd,
  }
  data.subvention.saving = data.subvention.new_value - data.subvention.old_value;

  data.total = {
    item: 'Total',
    old_value: data.demand.old_value + data.surcharge.old_value + data.peaktusd.old_value + data.offpeaktusd.old_value + data.energy.old_value,
    new_value: data.demand.new_value + data.surcharge.new_value + data.peaktusd.new_value + data.offpeaktusd.new_value + data.energy.new_value,
    saving: data.demand.saving + data.surcharge.saving + data.peaktusd.saving + data.offpeaktusd.saving + data.energy.saving + data.subvention.saving,
    class: 'font-bold  py-8 bg-slate-200'
  }

  return Object.values(data)

})

function formatNum(num) {
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

</script>

<style></style>