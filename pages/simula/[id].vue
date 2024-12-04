<template>
  <div class="container">
    <UDivider label="Dados" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
    <div class="grid grid-cols-12 grid-flow-col mt-5 mb-6" v-if="!loading">
      <div class="col-span-8 container">
        <p><span class="font-semibold text-gray-900">{{ selected_client[0].name }} </span><span>{{ ' - ' +
          selected_client[0].type }}</span></p>
        <p class="mt-3">Parametros:</p>
        <UTable :rows="dataRows" :columns="dataColumns" :ui="dataTableConfig"></UTable>
      </div>
      <div class="col-span-4 container">
        <NuxtImg src="/HiPower_ALSES_XL.webp" sizes="200px" class="place-self-center" />
        <p class="font-semibold text-gray-900 place-self-center">Equipamento sugerido: ALSES-2150-1000 </p>
      </div>
    </div>
    <UDivider label="Prévia mudanças na Conta" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
    <div class='sm:mx-36 mb-6'>
      <div>
        <p class="justify-self-center mt-3 text-slate-400">Valores entre {{ format(selectedStart, 'dd/MM/yyy') }} e {{ format(selectedEnd, 'dd/MM/yyy') }}</p>
      </div>
      <UTable :rows="billRows" :columns="billColumns" :ui="billTableConfig" class=''>
        <template #old-data="{ row }">
          <p class="justify-self-end">
            {{ row.old == 0 ? '-' : (row.old).toLocaleString() }}
          </p>
        </template>
        <template #new-data="{ row }">
          <p class="justify-self-end">
            {{ row.new == 0 ? '-' : (row.new).toLocaleString() }}
          </p>
        </template>
        <template #saving-data="{ row }">
          <p :class="'justify-self-end ' + (row.saving < 0 ? 'text-green-500' : 'text-red-700')">
            {{ row.saving == 0 ? '-' : (row.saving).toLocaleString() }}
          </p>
        </template>
      </UTable>
    </div>


    <UDivider label="Gráficos" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
    <div class="flex justify-between mx-auto mb-5" v-if="!loading">
      <div class="">
        <p class="justify-self-left text-base text-gray-600">Início:</p>
        <UPopover :popper="{ placement: 'bottom-start' }" :ui="{ base: 'bg-white z-50', }">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(selectedStart, 'dd/MM/yyy')"
            :ui="{ base: 'border p-3 rounded-md' }" />

          <template #panel="{ close }">
            <DatePicker v-model="selectedStart" is-required @close="close" :min-date="tstamps_limits[0].min_timestamp"
              :max-date="selectedEnd" />
          </template>
        </UPopover>
        <p class="justify-self-center text-gray-500 text-xs">Mínimo {{ format(tstamps_limits[0].min_timestamp,
          'dd/MM/yyy') }}
        </p>
      </div>
      <div class="">
        <p class="justify-self-left text-base text-gray-600">Fim:</p>
        <UPopover :popper="{ placement: 'bottom-start' }" :ui="{ base: 'bg-white z-50', }">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(selectedEnd, 'dd/MM/yyy')"
            :ui="{ base: 'border p-3 rounded-md' }" />

          <template #panel="{ close }">
            <DatePicker v-model="selectedEnd" is-required @close="close" :min-date="selectedStart"
              :max-date="tstamps_limits[0].max_timestamp" />
          </template>
        </UPopover>
        <p class="justify-self-center text-gray-500 text-xs">Máximo {{ format(tstamps_limits[0].max_timestamp,
          'dd/MM/yyy') }}
        </p>
      </div>
    </div>

    <div class="justify-center mx-auto my-1 px-0 container">
      <PowerChart :data="filtered_performance" v-if="!loading"
        :ui="{ base: 'justify-self-center mx-auto mb-5 m-w-0' }" />
    </div>
    <div class="justify-center mx-auto my-1 px-0 container">
      <BESSChart :data="filtered_performance" v-if="!loading"
        :ui="{ base: 'justify-self-center mx-auto mb-5 m-w-0' }" />
    </div>
    <div class="mt-8 container" v-if="!loading">
      <UDivider label="Tabela" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
      <div class="flex justify-center mt-5 align-middle">
        <p class="sm:flex hidden my-auto mr-5">Paginas</p>
        <div class="border-gray-200 dark:border-gray-700 py-3.5">
          <UPagination v-model="page" :page-count="pageCount" :total="filtered_performance.length" class="container"
            :ui="{
              wrapper: 'flex items-center gap-1 btn',
              base: 'border',
              rounded: '!rounded-full min-w-[32px] justify-center',
              default: {
                activeButton: {
                  // class: 'bg-slate-200'
                }
              }
            }" />
        </div>
      </div>

      <UTable :rows="rows" :columns="columns" :ui="tableConfig">
        <template #timestamp-data="{ row }">
          <NuxtTime :datetime="row.timestamp" year="numeric" month="numeric" day="numeric" hour="numeric"
            minute="numeric" class="mx-2" />
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


  </div>
</template>

<script setup>
import { format } from 'date-fns'

definePageMeta({
  middleware: ["auth"],
})
const user = useSupabaseUser();
const client = useSupabaseClient();
const route = useRoute();

const selectedStart = ref(null);
const selectedEnd = ref(null);

const page = ref(1);
const pageCount = 50;

const loading = ref(true);

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
  return filtered_performance.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
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
    { parameter: 'Capacidade (kWh)', value: project.value.energy_capacity },
    { parameter: 'Potência (kW)', value: project.value.output_rating },
    { parameter: 'RTE (%)', value: (100 - project.value.discharge_losses - project.value.charge_losses) },
    { parameter: 'Max SoC (%)', value: project.value.max_soc },
    { parameter: 'Min SoC (%)', value: project.value.min_soc },
    { parameter: 'Ciclos Usados no Período', value: cycles_in_period.value, class: 'bg-green-500/50' },
    { parameter: 'Máxima Potência Requerida (kW)', value: max_power_in_period.value, class: 'bg-green-500/50' },
  ]
})

const cycles_in_period = computed(() => {
  return filtered_performance.value[filtered_performance.value.length - 1].bess_cycles.toFixed(2)
})

const max_power_in_period = computed(() => {
  return Math.max.apply(Math, filtered_performance.value.map((x) => x.service_from_bess))
})

const billTableConfig = {
  base: 'justify-self-center place-content-center  my-3',
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

const billColumns = [
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
    label: 'Economia (R$)'
  }
];

const billRows = computed(() => {
  let demand = {
    item: 'Demanda (kW)',
    old: Math.max.apply(Math, filtered_performance.value.map((x) => x.aggregate)),
    new: Math.max.apply(Math, filtered_performance.value.map((x) => x.service_grid)),
    saving: ''
  }
  let surcharge = {
    item: 'Ultrapassagem (kW)',
    old: demand.old - project.value.contracted_demand,
    new: demand.new - project.value.contracted_demand,
    saving: ''
  }
  let offpeaktusd = {
    item: 'TUSD Fora Ponta (kWh)',
    old: filtered_performance.value.reduce(function (acc, cur) { return acc + cur.off_peak }, 0) / 4,
    new: filtered_performance.value.reduce(function (acc, cur) { return acc + (cur.off_peak > 0 ? cur.off_peak + cur.service_to_bess - cur.service_from_bess : 0) }, 0) / 4,
    saving: ''
  }
  let peaktusd = {
    item: 'TUSD Ponta (kWh)',
    old: filtered_performance.value.reduce(function (acc, cur) { return acc + cur.peak }, 0) / 4,
    new: filtered_performance.value.reduce(function (acc, cur) { return acc + (cur.peak > 0 ? cur.peak + cur.service_to_bess - cur.service_from_bess : 0) }, 0) / 4,
    saving: ''
  }
  let energy = {
    item: 'Energia Adicional (kWh)',
    old: 0,
    new: peaktusd.new + offpeaktusd.new - peaktusd.old - offpeaktusd.old,
    saving: ''
  }
  demand.saving = (demand.new - demand.old) * project.value.bill_tar_demand;
  surcharge.saving = (surcharge.new - surcharge.old) * project.value.bill_tar_surcharge;
  peaktusd.saving = (peaktusd.new - peaktusd.old) * project.value.bill_tar_peaktusd;
  offpeaktusd.saving = (offpeaktusd.new - offpeaktusd.old) * project.value.bill_tar_offpeaktusd;
  energy.saving = (energy.new - energy.old) * project.value.bill_tar_energy;

  let total = {
    item: 'Total',
    old: 0,
    new: 0,
    saving: demand.saving + surcharge.saving + peaktusd.saving + offpeaktusd.saving + energy.saving
  }

  return [demand, surcharge, peaktusd, offpeaktusd, energy, total]
})


const filtered_performance = computed(() => {
  page.value = 1;
  return performance.value.filter((p) => new Date(p.timestamp) >= selectedStart.value && new Date(p.timestamp) <= selectedEnd.value)
})

const pages = computed(() => {
  let array = new Array();
  for (let i = 0; i < pageCount; i++) {
    array[i] = i;
  }
  return array
})

const minDate = computed(() => {
  return tstamps_limits.value[0].min_timestamp
})

const maxDate = computed(() => {
  return tstamps_limits.value[0].max_timestamp
})

// const selectedStart = computed({
//   get() {return minDate.value},
//   set(newVal) {selectedStart.value = newVal}
// })

// const selectedEnd = computed({
//   get() {return addDays(new Date(minDate.value), 7)},
//   set(newVal) {selectedEnd.value = newVal}
// })


const { data: selected_client } = await useAsyncData('selected_client', async () => {
  const { data } = await client.from('clients').select().eq('id', route.params.id);
  return data
})

const { data: project } = await useAsyncData('project', async () => {
  const { data } = await client.from('projects').select().eq('client_id', route.params.id);
  return data[0]
})

const { data: tstamps_limits } = await useAsyncData('tstamps_limits', async () => {
  const { data } = await client.rpc('get_consumption_timestamps', {
    pid: project.value.id
  });
  data[0].min_timestamp = Date.parse(data[0].min_timestamp);
  data[0].max_timestamp = Date.parse(data[0].max_timestamp);
  return data
})

const { data: performance } = await useAsyncData('performance', async () => {
  const { data } = await client.from('consumptions').select('timestamp, aggregate, peak, off_peak').eq('project_id', project.value.id);
  return data
});

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

async function consumerBESS() {

  performance.value.forEach((item, index, arr) => {

    var item = arr[index];
    item.contracted = project.value.contracted_demand;
    item.bess_capacity = project.value.energy_capacity;
    item.eff_charge = (100 - project.value.charge_losses) / 100;
    item.eff_discharge = (100 - project.value.discharge_losses) / 100;
    item.bess_min = project.value.min_soc * item.bess_capacity / 100;
    item.bess_max = project.value.max_soc * item.bess_capacity / 100;

    if (index == 0) {
      item.bess_energy = 0;
      item.bess_cycles = 0;
    } else {
      item.bess_energy = arr[index - 1].bess_energy;
      item.bess_cycles = arr[index - 1].bess_cycles;
    }

    if (item.peak > 0) {
      item.power_available = 0;
      item.power_requested = item.peak;
    } else {
      item.power_available = Math.max(item.contracted - item.aggregate, 0);
      item.power_requested = Math.max(item.aggregate - item.contracted, 0);
    }

    if (item.power_available > 0) {
      item.bess_gross_charge = Math.min(item.power_available / 4, (item.bess_max - item.bess_energy) / item.eff_charge);
      item.bess_net_charge = item.bess_gross_charge * item.eff_charge;
      item.bess_gross_discharge = 0;
      item.bess_net_discharge = 0;

      item.bess_energy += item.bess_net_charge;
    } else if (item.power_requested > 0) {
      item.bess_gross_charge = 0;
      item.bess_net_charge = 0;
      item.bess_gross_discharge = Math.min(item.bess_energy - item.bess_min, item.power_requested / 4 / item.eff_discharge);
      item.bess_net_discharge = item.bess_gross_discharge * item.eff_discharge;

      item.bess_energy -= item.bess_gross_discharge;
    }

    item.bess_soc = item.bess_energy / item.bess_capacity;
    item.bess_cycles += item.bess_net_discharge / item.bess_capacity;

    item.service_grid = item.aggregate - item.bess_net_discharge * 4;
    item.service_to_bess = item.bess_gross_charge * 4;
    item.service_from_bess = item.bess_net_discharge * 4;

    arr[index] = item;
  });
  loading.value = false;
}

onMounted(async () => {

  loading.value = false;
  selectedStart.value = new Date(minDate.value);
  selectedEnd.value = addDays(new Date(minDate.value), 7);
  consumerBESS();
  // console.log(performance.value[270]);
});

</script>

<style></style>