<template>
  <div>
    <div
      class="items-center space-x-4 space-y-24 mt-24 container"
      v-if="loading"
    >
      <UProgress animation="carousel" />
    </div>
    <div class="container" v-else>
      <UDivider
        label="Dados"
        :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
      />
      <ConsumerProjectData
        v-model="bess_capacity"
        :data="filtered_performance"
        :project="project_info"
      />

      <UDivider
        label="Prévia mudanças na Conta"
        :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
      />
      <div class="top-28 z-40 sticky bg-gray-50 bg-opacity-80 pb-2">
        <DatePickerBar
          v-model="dateRange"
          :start="dateRangeLimits.min"
          :end="dateRangeLimits.max"
        />
      </div>
      <ConsumerBillTable
        :performance="filtered_performance"
        :project="project_info"
      />

      <UDivider
        label="Gráficos"
        :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
      />
      <br />
      <PowerChart
        :data="filtered_performance"
        :ui="{ base: 'justify-self-center mx-auto mb-5 m-w-0' }"
      />
      <br />
      <BESSChart
        :data="filtered_performance"
        :ui="{ base: 'justify-self-center mx-auto mb-5 m-w-0' }"
      />
      <br />

      <UDivider
        label="Tabela"
        :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
      />
      <BESSTable
        v-model="page"
        :filtered_performance="filtered_performance"
        :project="project_info"
      />
    </div>
  </div>
</template>

<script setup>
import { format } from "date-fns";

definePageMeta({
  middleware: ["auth"],
});
const client = useSupabaseClient();
const route = useRoute();

const dateRange = ref({ start: null, end: null });
const page = ref(1);
const loading = ref(true);

onBeforeRouteLeave((to, from) => {
  // Hard fix for components breaking when navigating to other pages
  loading.value = true;
});

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

const { data: project_data } = await useAsyncData("project_data", async () => {
  const { data } = await client
    .from("projects")
    .select("*, consumptions(*), client:clients!inner(*)")
    .eq("id", route.params.id)
    .single();
  return data;
});

const dateRangeLimits = computed(() => {
  if (!project_data?.value) return { min: null, max: null };
  const timestamps = project_data.value.consumptions.map((consumption) =>
    Date.parse(consumption.timestamp)
  );
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  return {
    min: new Date(minTimestamp),
    max: new Date(maxTimestamp),
  };
});

const project_info = computed(() => {
  if (!project_data?.value) return null;
  const { consumptions, ...rest } = project_data.value;
  return rest;
});

const filtered_performance = computed(() => {
  page.value = 1;
  let perf = project_data.value.consumptions.filter(
    (p) =>
      new Date(new Date(p.timestamp).toDateString()) >=
        new Date(new Date(dateRange.value.start).toDateString()) &&
      new Date(new Date(p.timestamp).toDateString()) <
        new Date(new Date(dateRange.value.end).toDateString())
  );
  return perf;
});

const bess_capacity = computed({
  get: () => project_data?.value.energy_capacity,
  set: (value) => {
    project_data.value.energy_capacity = value;
    setTimeout(consumerBESS, 1000);
    // emit('update:model-value', value)
  },
});

onMounted(async () => {
  dateRange.value = {
    start: new Date(dateRangeLimits.value.min),
    end: addDays(new Date(dateRangeLimits.value.min), 7),
  };
  await consumerBESS();
  loading.value = false;
});

async function consumerBESS() {
  project_data.value.consumptions.forEach((item, index, arr) => {
    var item = arr[index];
    item.contracted = project_data.value.contracted_demand;
    item.bess_capacity = project_data.value.energy_capacity;
    item.eff_charge = (100 - project_data.value.charge_losses) / 100;
    item.eff_discharge = (100 - project_data.value.discharge_losses) / 100;
    item.bess_min = (project_data.value.min_soc * item.bess_capacity) / 100;
    item.bess_max = (project_data.value.max_soc * item.bess_capacity) / 100;

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
      item.bess_gross_charge = Math.min(
        item.power_available / 4,
        (item.bess_max - item.bess_energy) / item.eff_charge
      );
      item.bess_net_charge = item.bess_gross_charge * item.eff_charge;
      item.bess_gross_discharge = 0;
      item.bess_net_discharge = 0;

      item.bess_energy += item.bess_net_charge;
    } else if (item.power_requested > 0) {
      item.bess_gross_charge = 0;
      item.bess_net_charge = 0;
      item.bess_gross_discharge = Math.min(
        item.bess_energy - item.bess_min,
        item.power_requested / 4 / item.eff_discharge
      );
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
</script>

<style></style>
