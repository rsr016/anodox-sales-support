<template>
  <div>
    <UPagination v-model="page" :page-count="pageCount" :total="props.filtered_performance.length" class="container" :ui="{
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
          {{ (row.service_grid + row.service_to_bess - row.service_from_bess).toFixed(2) }}
        </p>
      </template>
      <template #service_from_bess-data="{ row }">
        <p class="justify-self-center">
          {{ (row.service_from_bess).toFixed(2) }}
        </p>
      </template>
      <template #service_to_bess-data="{ row }">
        <p class="justify-self-center">
          {{ (row.service_to_bess).toFixed(2) }}
        </p>
      </template>
      <template #bess_energy-data="{ row }">
        <p class="justify-self-center">
          {{ (row.bess_energy).toFixed(2) }}
        </p>
      </template>
      <template #bess_soc-data="{ row }">
        <p class="justify-self-center">
          {{ (row.bess_soc * 100).toFixed(0) }} %
        </p>
      </template>
    </UTable>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  filtered_performance: {
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

const pageCount = ref(50);


const tableConfig = {
  wrapper: 'overflow-x-auto',
  base: 'mx-auto justify-self-center table-auto',
  divide: 'divide-y divide-gray-300 dark:divide-gray-700',
  td: {
    base: 'whitespace-nowrap p-24',
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
    label: 'Consumo Original (kW)',
    class: 'max-w-40'
  },
  {
    key: 'service_grid',
    label: 'Rede (kW)'
  },
  {
    key: 'service_from_bess',
    label: 'Descarga BESS (kW)',
    class: 'max-w-30 px-2'
  },
  {
    key: 'service_to_bess',
    label: 'Carga BESS (kw)',
    class: 'max-w-30 px-2'
  },
  {
    key: 'bess_energy',
    label: 'Armazenado (kWh)',
    class: 'max-w-30  px-2'
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