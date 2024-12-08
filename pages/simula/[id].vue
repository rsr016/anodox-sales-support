<template>
  <div>
    <div class="items-center space-x-4 space-y-24 mt-24 container" v-if="loading">
      <UProgress animation="carousel" />
    </div>
    <div class="container" v-else>
      <div>
        <UDivider label="Dados" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
        <ConsumerProjectData v-model="bess_capacity" :data="filtered_performance" :client="selected_client[0]" :project="project" />
      </div>
      <UDivider label="Prévia mudanças na Conta" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
      <div class="top-28 z-40 sticky bg-gray-50 bg-opacity-80 pb-2">
        <DatePickerBar v-model="dateRange" :start="new Date(tstamps_limits[0].min_timestamp)"
          :end="new Date(tstamps_limits[0].max_timestamp)" />
      </div>
      <ConsumerBillTable :performance="filtered_performance" :project="project" />

      <UDivider label="Gráficos" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
      <br>
      <PowerChart :data="filtered_performance" :ui="{ base: 'justify-self-center mx-auto mb-5 m-w-0' }" />
      <br>
      <BESSChart :data="filtered_performance" :ui="{ base: 'justify-self-center mx-auto mb-5 m-w-0' }" />

      <br>
      <UDivider label="Tabela" :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }" />
      <BESSTable v-model="page" :filtered_performance="filtered_performance" />
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

definePageMeta({
  middleware: ["auth"],
})
const client = useSupabaseClient();
const route = useRoute();

const dateRange = ref({ start: null, end: null });
const page = ref(1);
const loading = ref(true);
const bess_capacity = ref(null);


const minDate = computed(() => {
  return tstamps_limits.value[0].min_timestamp
})

const { data: selected_client } = await useAsyncData('selected_client', async () => {
  const { data } = await client.from('clients').select().eq('id', route.params.id);
  return data
})

const { data: project } = await useAsyncData('project', async () => {
  const { data } = await client.from('projects').select().eq('client_id', route.params.id);
  bess_capacity.value = data[0].energy_capacity;
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


const filtered_performance = computed(() => {
  page.value = 1;
  let perf = performance.value.filter((p) => new Date(new Date(p.timestamp).toDateString()) >= new Date(new Date(dateRange.value.start).toDateString()) && new Date(new Date(p.timestamp).toDateString()) < new Date(new Date(dateRange.value.end).toDateString()));  
  return perf
})

async function consumerBESS() {

  performance.value.forEach((item, index, arr) => {

    var item = arr[index];
    item.contracted = project.value.contracted_demand;
    item.bess_capacity = bess_capacity.value;
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
}

watch(() => bess_capacity.value, () => {
  setTimeout(consumerBESS, 2000);
});

onMounted(async () => {
  dateRange.value = {
    start: new Date(minDate.value),
    end: addDays(new Date(minDate.value), 7)
  }
  await consumerBESS();
  loading.value = false;
});

</script>

<style></style>