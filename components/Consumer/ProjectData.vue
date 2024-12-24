<template>
  <div>
    <div class="grid grid-cols-12 grid-flow-col mt-5 mb-6">
      <div class="col-span-12 md:col-span-8 container">
        <p><span class="font-semibold text-gray-900">{{ project.client.name }} </span><span>{{ ' - ' +
          project.type }}</span><UButton @click.prevent="router.push('/editar/projeto/' + project.id)" class="ml-5">Editar Projeto</UButton></p>
        <p class="mt-3">Parametros:</p>
        <UTable :rows="dataRows" :columns="dataColumns" :ui="dataTableConfig">
          <template #value-data="{ row }">
            <UInput v-model="bess_capacity" v-if="row.parameter == 'Capacidade (kWh)'" />
            <div v-else>
              {{ row.value }}
            </div>
          </template>
        </UTable>
      </div>
      <div class="md:flex hidden col-span-4 container">
        <NuxtImg src="/HiPower_ALSES_XL.webp" sizes="200px" class="place-self-center" />
        <p class="font-semibold text-gray-900 place-self-center">Equipamento sugerido: ALSES-2150-1000 </p>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  data: {
    type: Object,
    required: false,
  },
  project: {
    type: Object,
    required: false,
  }
})

const emit = defineEmits(['update:model-value', 'close'])
const router = useRouter();

const bess_capacity = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  }
})


const dataTableConfig = {
  base: 'justify-self-center my-3',
  divide: 'divide-y divide-gray-300 dark:divide-gray-700',
  th: {
    base: 'hidden'
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

const dataColumns = [
  {
    key: 'parameter',
    label: 'Parametro',
  },
  {
    key: 'value',
    label: 'Valor',
    class: 'max-w-40'
  }
];

const dataRows = computed(() => {
  return [
    { parameter: 'Capacidade (kWh)', value: props.project.energy_capacity },
    { parameter: 'Potência (kW)', value: props.project.output_rating },
    { parameter: 'RTE (%)', value: (100 - props.project.discharge_losses - props.project.charge_losses) },
    { parameter: 'Max SoC (%)', value: props.project.max_soc },
    { parameter: 'Min SoC (%)', value: props.project.min_soc },
    { parameter: 'Ciclos Usados no Período', value: cycles_in_period.value, class: 'bg-green-500/50' },
    { parameter: 'Máxima Potência Requerida (kW)', value: max_power_in_period.value, class: 'bg-green-500/50' },
  ]
})

const cycles_in_period = computed(() => {
  return props.data[props.data.length - 1].bess_cycles.toFixed(2)
})

const max_power_in_period = computed(() => {
  return Math.max.apply(Math, props.data.map((x) => x.service_from_bess))
})

</script>

<style></style>