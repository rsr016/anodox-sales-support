<template>
  <div>
    <LoadingIndicator v-if="loading" />
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
        class="lg:mx-36 mb-6"
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
import { format, parseISO } from "date-fns";

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
    .select("*, powerprofile(*), client:clients!inner(*)")
    .eq("id", route.params.id)
    .single();
  return data;
});

const dateRangeLimits = computed(() => {
  if (!project_data?.value) return { min: null, max: null };
  const timestamps = project_data.value.powerprofile.map((consumption) =>
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
  const { powerprofile, ...rest } = project_data.value;
  return rest;
});

const filtered_performance = computed(() => {
  page.value = 1;
  let perf = project_data.value.powerprofile.filter(
    (p) =>
      new Date(new Date(p.timestamp).toDateString()) >=
        new Date(new Date(dateRange.value.start).toDateString()) &&
      new Date(new Date(p.timestamp).toDateString()) <=
        new Date(new Date(dateRange.value.end).toDateString())
  );
  return perf;
});

const bess_capacity = computed({
  get: () => project_data?.value.energy_capacity,
  set: (value) => {
    project_data.value.energy_capacity = value;
    setTimeout(function () {
      consumerBESS(project_data.value);
    }, 1000);
    // emit('update:model-value', value)
  },
});

onMounted(async () => {
  dateRange.value = {
    start: new Date(dateRangeLimits.value.min),
    end: addDays(new Date(dateRangeLimits.value.min), 7),
  };
  project_data.value = await consumerBESS(project_data.value);
  loading.value = false;
  // let teste = dataToCSV(project_data.value.powerprofile);
  // console.log(teste)
});

</script>

<style></style>
