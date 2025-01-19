<template>
  <div class=''>
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
  base: 'justify-self-center place-content-center table-auto',
  divide: 'divide-y divide-gray-300 dark:divide-gray-700',
  th: {
    base: "text-center bg-slate-200",
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
  try {
    return consumerBill(props.performance, props.project);
  } catch (error) {
    return [];
  }
  
})

function formatNum(num) {
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

</script>

<style></style>