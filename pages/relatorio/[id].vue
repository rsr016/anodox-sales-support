<template>
  <div>
    <LoadingIndicator v-if="loading" />
    <!-- Only avoided surcharge, avoided peak, and additional energy -->

    <div v-else class="container mx-5">
      <UTable
        :columns="tableColumns"
        :rows="billsByMonth"
        :ui="tableUI"
        v-model:expand="expand"
        :multiple-expand="false"
      >
        // v-model="selectedRows" @select="select">
        <template #month-data="{ row }">
          <p class="font-bold text-center text-lg">
            {{
              intlFormat(
                parseISO(row.month.toString(), "yyyyMM"),
                { month: "short" },
                { locale: "pt-BR" }
              )
            }}
          </p>
        </template>
        <template #consumption-data="{ row }">
          <div class="grid grid-rows-2 gap-1">
            <p class="font-bold text-center">
              {{
                formatNum(
                  row.bill[2].new +
                    row.bill[3].new -
                    row.bill[2].old -
                    row.bill[3].old
                )
              }}
            </p>
            <p class="text-sm font-light text-center">
              {{ formatNum(row.bill[2].old + row.bill[3].old) }} ->
              {{ formatNum(row.bill[2].new + row.bill[3].new) }}
            </p>
          </div>
        </template>
        <template #peak-data="{ row }">
          <div class="grid grid-rows-2 gap-1">
            <p class="font-bold text-center">
              {{ formatNum(row.bill[3].new - row.bill[3].old) }}
            </p>
            <p class="text-sm font-light text-center">
              {{ formatNum(row.bill[3].old) }} ->
              {{ formatNum(row.bill[3].new) }}
            </p>
          </div>
        </template>
        <template #offpeak-data="{ row }">
          <div class="grid grid-rows-2 gap-1">
            <p class="font-bold text-center">
              {{ formatNum(row.bill[2].new - row.bill[2].old) }}
            </p>
            <p class="text-sm font-light text-center">
              {{ formatNum(row.bill[2].old) }} ->
              {{ formatNum(row.bill[2].new) }}
            </p>
          </div>
        </template>
        <template #saving-data="{ row }">
          <p class="font-bold text-center">
            {{ formatNum(row.bill[6].saving) }}
          </p>
        </template>
        <template #expand="{ row }">
          <ConsumerBillTable
            :performance="row.data"
            :project="project_data"
            class="mx-2 bg-slate-100 border"
          />
        </template>
      </UTable>
    </div>

    <!-- <div class="container" v-else>
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
    </div> -->
  </div>
</template>

<script setup>
import { format, intlFormat, parseISO } from "date-fns";

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

const { data: project_data } = await useAsyncData("project_data", async () => {
  const { data } = await client
    .from("projects")
    .select("*, powerprofile(*), client:clients!inner(*)")
    .eq("id", route.params.id)
    .single();
  return data;
});

const expand = ref({
  openedRows: [],
  row: {},
});

const tableColumns = [
  { key: "month", label: "Mês", sortable: true },
  { key: "consumption", label: "Consumo" },
  { key: "peak", label: "Ponta" },
  { key: "offpeak", label: "Fora Ponta" },
  { key: "saving", label: "Economia" },
];

const tableUI = {
  base: "min-w-0 table-auto justify-self-center",
  th: {
    base: "text-center",
  },
};

const billsByMonth = computed(() => {
  let months = project_data.value.powerprofile.reduce((acc, cur) => {
    const month = new Date(cur.timestamp).getMonth();
    const year = new Date(cur.timestamp).getFullYear();
    const key = year * 100 + month + 1;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(cur);
    return acc;
  }, {});

  let id = 0;
  return Object.keys(months).map((month_key) => {
    return {
      id: id++,
      month: month_key,
      bill: consumerBill(months[month_key], project_data.value),
      data: months[month_key],
      start: months[month_key][0].timestamp,
      end: months[month_key][months[month_key].length - 1].timestamp,
    };
  });
});

function variationString(o, n) {
  const diff = n - o;

  const percent = (diff / o) * 100;
  return `${diff} (${percent.toFixed(2)}%)`;
}

onMounted(async () => {
  dateRange.value = {
    start: new Date(dateRangeLimits.value.min),
    end: addDays(new Date(dateRangeLimits.value.min), 7),
  };
  project_data.value = await consumerBESS(project_data.value);
  loading.value = false;
});

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

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
      new Date(new Date(p.timestamp).toDateString()) <
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
</script>

<style></style>
