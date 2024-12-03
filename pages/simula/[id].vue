<template>
  <div class="container">
    <div class="gap-4 grid grid-cols-12 grid-flow-col my-5">
      <div class="gap-4 grid grid-cols-1 grid-rows-5 grid-flow-col col-span-6">
        <div class="row-span-2">
          <p class="font-semibold text-gray-900">{{ selected_client[0].name }}</p>
          <p>{{ selected_client[0].type }}</p>
        </div>
        <div class="row-span-3" v-if="!loading">
          <p class="">Capacidade: {{ project.energy_capacity }} kWh</p>
          <p class="">Demanda contratada: {{ project.contracted_demand }} kW</p>
          <p class="">Ciclos usados no período: {{ performance[performance.length - 1].bess_cycles.toFixed(2) }} ciclos
          </p>
        </div>


      </div>
      <div class="col-span-6 max-h-64 container">
        <NuxtImg src="/HiPower_ALSES_XL.webp" sizes="200px" class="place-self-center" />
        <p class="font-semibold text-gray-900 place-self-center">Equipamento sugerido: ALSES-2150-1000 </p>
      </div>

    </div>
    
    <div class="flex justify-start mx-auto my-5" v-if="!loading">
      <div class="mx-auto">
        <UPopover :popper="{ placement: 'bottom-start' }" :ui="{base: 'bg-white z-50',}">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(selectedStart, 'd MMM, yyy')" />

          <template #panel="{ close }">
            <DatePicker v-model="selectedStart" is-required @close="close" />
          </template>
        </UPopover>
      </div>
      <div class="mx-auto">
        <UPopover :popper="{ placement: 'bottom-start' }" :ui="{base: 'bg-white z-50',}">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(selectedEnd, 'd MMM, yyy')" />

          <template #panel="{ close }">
            <DatePicker v-model="selectedEnd" is-required @close="close" />
          </template>
        </UPopover>
      </div>
    </div>
    <BESSChart :data="filtered_performance" v-if="!loading" class="mb-5" />

    <div class="container" v-if="!loading">
      <div class="flex justify-end align-middle">
        <p class="my-auto mr-5">Paginas</p>
        <!-- <p class="my-auto">{{ page }} de {{ pages.length }}</p> -->
        <div class="border-gray-200 dark:border-gray-700 py-3.5">
          <UPagination v-model="page" :page-count="pageCount" :total="performance.length" class="container" :ui="{
            wrapper: 'flex items-center gap-1 btn',
            base: 'border btn-light',
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: {
              activeButton: {
                class: 'bg-slate-200'
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

const loading = ref(true);

const tableConfig = {
  divide: 'divide-y divide-gray-300 dark:divide-gray-700',
  td: {
    base: 'whitespace-nowrap',
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

const page = ref(1)
const pageCount = 50

const rows = computed(() => {
  return filtered_performance.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})

const filtered_performance = computed(() => {
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