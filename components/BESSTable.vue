<template>
  <div>
    <UPagination v-model="page" :page-count="pageCount" :total="props.filtered_performance.length" class="container"
      :ui="{
        wrapper: 'flex items-center gap-1 justify-center',
        base: 'mt-5',
        rounded: '!rounded-full min-w-[32px] justify-center',
        default: {
          activeButton: {
          }
        }
      }" />

    <UTable :rows="rows" :columns="columns" :ui="tableConfig">
      <template #timestamp-data="{ row }">
        <NuxtTime :datetime="row.timestamp" year="numeric" month="numeric" day="numeric" hour="numeric" minute="numeric"
          class="mx-2" />
      </template>
      <template #aggregate-data="{ row }">
        <p class="justify-self-center">
          {{ (row.aggregate).toFixed(2) }}
        </p>
      </template>
      <template #service_grid-data="{ row }">
        <p class="justify-self-center">
          {{ (row.service_grid + row.service_to_bess).toFixed(2) }}
        </p>
      </template>
      <template #flow_bess-data="{ row }">
        <p
          :class="'justify-self-end text-' + flowColor(row) + '-400'">
          {{ row.service_to_bess - row.service_from_bess == 0 ? '-' : formatNum(row.service_to_bess -
            row.service_from_bess) }}
        </p>
      </template>
      <template #bess_soc-data="{ row }">
        <UMeter :color="barColor(row)" :value="row.bess_soc * 100" indicator>
          <template #indicator="{ percent }">
            <div class="flex justify-between text-sm">
              <div class='md:flex hidden mr-1'>{{ Math.round(row.bess_energy) }} kWh</div>
              <div>({{ percent.toFixed(0) }}%)</div>
            </div>
          </template>
        </UMeter>
      </template>
    </UTable>
  </div>
</template>

<script setup>
import colors from "#tailwind-config/theme/colors";

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  filtered_performance: {
    type: Object,
    required: false,
  },
  project: {
    type: Object,
    required: false,
  }
})

const emit = defineEmits(['update:model-value', 'close'])

const page = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  }
})

function formatNum(num) {
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const pageCount = ref(50);

function barColor(r) {
  let level = r.bess_soc * 100
  let min = props.project.min_soc
  let max = props.project.max_soc
  return level <= min ? 'red' : (level >= max ? 'gray' : 'green')
}

function flowColor(r) {
  let flow = r.service_from_bess - r.service_to_bess
  return flow == 0 ? 'gray' : (flow > 0 ? 'green' : 'red')
}

const tableConfig = {
  wrapper: 'overflow-x-auto',
  base: 'justify-self-center table-auto min-w-0',
  divide: 'divide-y divide-gray-300 dark:divide-gray-700',
  td: {
    base: 'whitespace-nowrap',
    padding: 'px-4 py-4',
  },
  tr: {
    base: 'hover:bg-slate-200',
  }
}

const columns = [
  {
    key: 'timestamp',
    label: 'Hora',
  },
  {
    key: 'aggregate',
    label: 'Consumo (kW)',
    class: 'max-w-40'
  },
  {
    key: 'flow_bess',
    label: 'Fluxo BESS (kw)',
    class: 'max-w-30 px-2'
  },
  {
    key: 'service_grid',
    label: 'Rede (kW)'
  },
  {
    key: 'bess_soc',
    label: 'SoC'
  }
];

const rows = computed(() => {
  return props.filtered_performance.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
})

</script>

<style></style>