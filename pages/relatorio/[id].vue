<template>
  <div>
    <LoadingIndicator v-if="loading" />
    <!-- Only avoided surcharge, avoided peak, and additional energy -->

    <div v-else class="container mx-5">
      <UModal v-model="optimizer.open">
        <UCard>
          <template #header>
            <p class="text-center font-bold text-lg">Otimizador</p>
          </template>

          <div class="p-2">
            <p class="font-light">Custo do sistema instalado (R$/kWh)</p>
            <UInput
              v-model="optimizer.cost"
              label="Custo do BESS"
              class="mb-3"
            />
            <UDivider
              label="Resultados"
              :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
            />
            <div
              class="grid grid-cols-2 grid-flow-row gap-2 justify-between my-3"
            >
              <p class="font-light">Capacidade do BESS:</p>
              <p class="text-right">
                {{ formatNum(optimizerResults.capacity) }} kWh
              </p>
              <p class="font-light">Custo do sistema:</p>
              <p class="text-right">
                R$ {{ formatNum(optimizerResults.price) }}
              </p>
              <p class="font-light">Retorno do investimento (no período):</p>
              <p class="text-right">
                {{ formatNum(optimizerResults.return * 100) }} %
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <UButton @click="optimizer.open = false">Fechar</UButton>
              <UButton
                :disabled="optimizer.calculating"
                @click="startOptimizing"
                :color="'emerald'"
                >Otimizar</UButton
              >
            </div>
          </template>
        </UCard>
      </UModal>

      <UDivider
        label="Resumo Geral"
        :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
      />
      <div class="container my-4">
        <div class="grid grid-cols-4 gap-2">
          <UCard :ui="cardUI">
            <template #header>
              <p class="text-center font-bold text-md">Período</p>
            </template>
            <p class="text-center font-bold text-md">
              {{ format(dateRangeLimits.min, "dd/MM/u") }} a
              {{ format(dateRangeLimits.max, "dd/MM/u") }}
            </p>
          </UCard>
          <UCard :ui="cardUI">
            <template #header>
              <p class="text-center font-bold text-md">Economia</p>
            </template>
            <p class="text-center font-bold text-lg text-green-600">
              {{ formatNum(overviewData.saving) }}
            </p>
          </UCard>
          <UCard :ui="cardUI">
            <template #header>
              <p class="text-center font-bold text-md">Custo</p>
            </template>
            <p class="text-center font-bold text-lg text-red-600">
              {{ formatNum(overviewData.cost) }}
            </p>
          </UCard>
          <UCard :ui="cardUI">
            <template #header>
              <p class="text-center font-bold text-md">Ganho</p>
            </template>
            <p class="text-center font-bold text-lg text-green-600">
              {{ formatNum(overviewData.gain) }}
            </p>
          </UCard>
        </div>
      </div>

      <div class="flex my-5 place-content-center place-items-center">
        <UButton
          @click="exportToCSV(project_data.powerprofile, project_data.id)"
          class="px-4 py-2"
          >Baixar dados completos em CSV</UButton
        >
      </div>

      <UDivider
        label="Contas Mensais"
        :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
      />

      <!-- <UAccordion
        color="emerald"
        variant="soft"
        size="sm"
        :items="billsByMonth"
      >
        <template #item="{ item }">
          <div class="container min-w-min">
            <ConsumerBillTable
              :performance="item.data"
              :project="project_data"
              class="mx-5 bg-slate-100 border"
            />
            <div class="h-5"></div>
          </div>
        </template>
      </UAccordion> -->

      <UTable
        :columns="tableColumns"
        :rows="billsByMonth"
        :ui="tableUI"
        v-model:expand="expand"
        :multiple-expand="false"
      >
        // v-model="selectedRows" @select="select">
        <template #month-data="{ row }">
          <p class="font-bold text-center text-xl">
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
            <div class="flex flex-inline">
              <p class="text-sm font-light text-center">
                {{ formatNum(row.bill[2].old + row.bill[3].old) }}
              </p>
              <UIcon
                name="i-hugeicons-arrow-right-02"
                class="w-3 h-3 mx-1 my-auto"
              />
              <p class="text-sm font-light text-center">
                {{ formatNum(row.bill[2].new + row.bill[3].new) }}
              </p>
            </div>
          </div>
        </template>
        <template #peak-data="{ row }">
          <div class="grid grid-rows-2 gap-1">
            <p class="font-bold text-center">
              {{ formatNum(row.bill[3].new - row.bill[3].old) }}
            </p>
            <div class="flex flex-inline">
              <p class="text-sm font-light text-center">
                {{ formatNum(row.bill[3].old) }}
              </p>
              <UIcon
                name="i-hugeicons-arrow-right-02"
                class="w-3 h-3 mx-1 my-auto"
              />
              <p class="text-sm font-light text-center">
                {{ formatNum(row.bill[3].new) }}
              </p>
            </div>
          </div>
        </template>
        <template #offpeak-data="{ row }">
          <div class="grid grid-rows-2 gap-1">
            <p class="font-bold text-center">
              {{ formatNum(row.bill[2].new - row.bill[2].old) }}
            </p>
            <div class="flex flex-inline">
              <p class="text-sm font-light text-center">
                {{ formatNum(row.bill[2].old) }}
              </p>
              <UIcon
                name="i-hugeicons-arrow-right-02"
                class="w-3 h-3 mx-1 my-auto"
              />
              <p class="text-sm font-light text-center">
                {{ formatNum(row.bill[2].new) }}
              </p>
            </div>
          </div>
        </template>
        <template #saving-data="{ row }">
          <UBadge
            size="lg"
            :label="formatNum(-row.bill[6].saving)"
            :color="'green'"
            variant="subtle"
          />
        </template>
        <template #expand="{ row }">
          <ConsumerBillTable
            :performance="row.data"
            :project="project_data"
            class="mx-2 bg-slate-100 border"
          />
          <div class="h-5"></div>
        </template>
      </UTable>
    </div>
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

const optimizer = ref({
  open: false,
  cost: 2000,
  calculating: false,
  previous_results: {},
  previous_cost_change: 0,
  previous_return_change: 0,
});

const optimizerResults = computed(() => {
  return {
    capacity: project_data.value.energy_capacity,
    price: optimizer.value.cost * project_data.value.energy_capacity,
    return:
      overviewData.value.gain /
      (optimizer.value.cost * project_data.value.energy_capacity),
  };
});

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      optimizer.value.open = !optimizer.value.open;
    },
  },
});

const tableColumns = [
  { key: "month", label: "Mês", sortable: true },
  { key: "consumption", label: "Consumo" },
  { key: "peak", label: "Ponta" },
  { key: "offpeak", label: "Fora Ponta" },
  { key: "saving", label: "Ganho" },
];

const tableUI = {
  base: "min-w-0 table-auto justify-self-center",
  th: {
    base: "text-center",
  },
  tr: {
    base: "hover:bg-slate-200",
  },
};

const cardUI = {
  base: "bg-slate-100",
  header: {
    background: "bg-slate-100",
    padding: "px-2 py-1 sm:p-2",
  },
  body: {
    padding: "px-2 py-2 sm:p-2",
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
      label:
        id +
        ". " +
        intlFormat(
          parseISO(month_key.toString(), "yyyyMM"),
          { month: "long" },
          { locale: "pt-BR" }
        ),
      // slot: "bill-data",
      month: month_key,
      bill: consumerBill(months[month_key], project_data.value),
      data: months[month_key],
      start: months[month_key][0].timestamp,
      end: months[month_key][months[month_key].length - 1].timestamp,
    };
  });
});

const overviewData = computed(() => {
  let overview = {
    saving: 0,
    cost: 0,
    gain: 0,
  };
  overview.saving = -billsByMonth.value.reduce((acc, cur) => {
    return (
      acc +
      cur.bill[0].saving +
      cur.bill[1].saving +
      cur.bill[3].saving +
      cur.bill[5].saving
    );
  }, 0);
  overview.cost = -billsByMonth.value.reduce((acc, cur) => {
    return acc + cur.bill[2].saving + cur.bill[4].saving;
  }, 0);
  overview.gain = overview.saving + overview.cost;
  return overview;
});

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

const bess_capacity_immediate = computed({
  get: () => project_data?.value.energy_capacity,
  set: (value) => {
    project_data.value.energy_capacity = value;
    consumerBESS(project_data.value);
  },
});

const bess_capacity_lazy = computed({
  get: () => project_data?.value.energy_capacity,
  set: (value) => {
    project_data.value.energy_capacity = value;
    setTimeout(function () {
      consumerBESS(project_data.value);
    }, 1000);
  },
});
</script>

<style></style>
