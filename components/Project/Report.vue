<template>
  <div class="mx-5">
    <UModal v-model="optimizer.open">
      <UCard>
        <template #header>
          <p class="text-center font-bold text-lg">Otimizador</p>
        </template>

        <div class="p-2">
          <p class="font-light">Custo do sistema instalado (R$/kWh)</p>
          <UInput v-model="optimizer.cost" label="Custo do BESS" class="mb-3" />
          <div class="flex justify-between">
            <div class="grow mr-5">
              <p class="font-light">Início (kWh)</p>
              <UInput
                v-model="optimizer.min_energy"
                label="Custo do BESS"
                class="mb-3"
              />
            </div>
            <div class="grow">
              <p class="font-light">Fim (kWh)</p>
              <UInput
                v-model="optimizer.max_energy"
                label="Custo do BESS"
                class="mb-3"
              />
            </div>
          </div>
          <UDivider
            label="Resultados"
            :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
          />
          <!-- <Transition name="slide-fade"> -->
          <div
            v-if="!optimizer.calculating && !optimizer.finalized"
            class="grid grid-cols-2 grid-flow-row gap-2 justify-between my-3"
          >
            <p class="font-light">Capacidade do BESS:</p>
            <p class="text-right">
              {{ formatNum(optimizerResults.capacity) }} kWh
            </p>
            <p class="font-light">Custo do sistema:</p>
            <p class="text-right">R$ {{ formatNum(optimizerResults.price) }}</p>
            <p class="font-light">Retorno do investimento (no período):</p>
            <p class="text-right">
              {{ formatNum(optimizerResults.return * 100) }} %
            </p>
          </div>
          <!-- <div v-else> -->
          <UProgress
            v-if="optimizer.calculating && !optimizer.finalized"
            :value="bess_capacity_immediate"
            :max="optimizer.max_energy"
            :color="'emerald'"
            animation="carousel"
            :ui="{ wrapper: 'my-3' }"
          />
          <highchart
            v-if="optimizer.calculating || optimizer.finalized"
            :options="chartOptions"
            class="border rounded-lg"
            :update="['options']"
            :redraw="true"
          />
          <!-- </div> -->

          <!-- </Transition> -->
        </div>

        <template #footer>
          <div class="flex justify-between">
            <UButton @click="optimizer.open = false">Fechar</UButton>
            <UButton
              :disabled="optimizer.calculating"
              @click.prevent="startOptimizing"
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
      <div class="grid grid-cols-4 gap-2 justify-center">
        <UCard :ui="cardUI">
          <template #header>
            <p class="text-center font-bold text-md">Período</p>
          </template>
          <p class="text-center font-bold text-md">
            {{ format(dateLimits.min, "dd/MM/u") }} a
            {{ format(dateLimits.max, "dd/MM/u") }}
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
        <div class="col-start-2">
          <UCard :ui="cardUI">
            <template #header>
              <p class="text-center font-bold text-sm">Demanda Evitada</p>
            </template>
            <p class="text-center text-sm">
              {{ formatNum(overviewData.demand) }}
            </p>
          </UCard>
        </div>
        <div class="col-start-3">
          <UCard :ui="cardUI">
            <template #header>
              <p class="text-center font-bold text-sm">TUSD Evitada</p>
            </template>
            <p class="text-center text-sm">
              {{ formatNum(overviewData.tusd) }}
            </p>
          </UCard>
        </div>
      </div>
    </div>

    <div class="flex my-5 place-content-center place-items-center">
      <UButton
        icon="i-hugeicons-download-04"
        @click="exportToCSV(modelValue.powerprofile, modelValue.id)"
        class="mx-3 py-2"
        >Relatório Completo CSV</UButton
      >
      <UButton
        icon="i-hugeicons-download-04"
        @click="exportToCSV(monthReport, 'mensal_' + modelValue.id)"
        class="mx-3 py-2"
        >Mensal CSV</UButton
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
              :project="modelValue"
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
      <template #demand-data="{ row }">
        <div class="grid grid-rows-2 gap-1">
          <p class="font-bold text-center">
            {{ formatNum(row.bill[0].new - row.bill[0].old) }}
          </p>
          <div class="flex flex-inline">
            <p class="text-sm font-light text-center">
              {{ formatNum(row.bill[0].old) }}
            </p>
            <UIcon
              name="i-hugeicons-arrow-right-02"
              class="w-3 h-3 mx-1 my-auto"
            />
            <p class="text-sm font-light text-center">
              {{ formatNum(row.bill[0].new) }}
            </p>
          </div>
        </div>
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
          :project="modelValue"
          class="mx-2 bg-slate-100 border"
        />
        <div class="h-5"></div>
      </template>
    </UTable>
  </div>
</template>

<script setup>
import { format, intlFormat, parseISO } from "date-fns";
import colors from "#tailwind-config/theme/colors";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  dateLimits: {
    type: Object,
    required: true,
  },
});

const expand = ref({
  openedRows: [],
  row: {},
});

const loaded = ref(false);

const optimizer = ref({
  open: false,
  cost: 2000,
  calculating: false,
  finalized: false,
  initial_energy: null,
  min_energy: 200,
  max_energy: 4000,
  previous_results: {},
  sizes: [],
  returns: [],
  previous_cost_change: 0,
  previous_return_change: 0,
});

async function startOptimizing() {
  optimizer.value.calculating = true;

  let steps = 20;
  let increment =
    (optimizer.value.max_energy - optimizer.value.min_energy) / steps;

  optimizer.initial_energy = props.modelValue.energy_capacity;
  bess_capacity_immediate.value = optimizer.value.min_energy;
  await new Promise((resolve) => setTimeout(resolve, 200));

  while (bess_capacity_immediate.value <= optimizer.value.max_energy) {
    optimizer.value.sizes.push(props.modelValue.value.energy_capacity);
    optimizer.value.returns.push(optimizerResults.value.return);
    bess_capacity_immediate.value = bess_capacity_immediate.value + increment;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  bess_capacity_immediate.value = optimizer.initial_energy;
  optimizer.value.finalized = true;
  optimizer.value.calculating = false;
}

const chartOptions = computed(() => {
  return {
    cycles: 0,
    chart: {
      type: "spline",
      scrollablePlotArea: {
        // minWidth: 700,
        scrollPositionX: 1,
      },
    },
    xAxis: {
      crosshair: true,
      // type: 'datetime',
      // minTickInterval: 365 * 24 * 36e5,
      labels: {
        align: "left",
      },
    },
    title: {
      text: "Retorno do Investimento",
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      headerFormat: "<b>{series.name}</b><br/>",
      pointFormat: "{point.x} kWh<br/>{point.y:.2f} % a.a.",
      style: {
        width: "250px",
      },
      valueSuffix: " %",
      shared: true,
    },

    yAxis: [
      {
        // min: 0,
        labels: {
          enabled: true,
        },
        title: {
          text: "",
        },
        gridLineColor: "rgba(0, 0, 0, 0.07)",
      },
    ],
    plotOptions: {
      area: {
        stacking: "normal",
        lineWidth: 0.8,
      },
      line: {
        lineWidth: 1.5,
      },
      flags: {
        tooltip: {
          xDateFormat: "%HH:%mm %B %e, %Y",
        },
        accessibility: {
          point: {
            valueDescriptionFormat:
              "{xDescription}. {point.title}: {point.text}.",
          },
        },
      },
    },
    series: [
      {
        yAxis: 0,
        name: "Retorno Anual (%)",
        id: "return",
        type: "spline",
        data: optimizer.value.sizes.map((size, index) => {
          return {
            x: size,
            y: optimizer.value.returns[index] * 100,
          };
        }),
        marker: {
          enabled: true,
        },
        color: colors.green[500],
      },
    ],
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
  { key: "demand", label: "Demanda" },
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

const optimizerResults = computed(() => {
  return {
    capacity: props.modelValue.energy_capacity,
    price: optimizer.value.cost * props.modelValue.energy_capacity,
    return:
      overviewData.value.gain /
      (optimizer.value.cost * props.modelValue.energy_capacity),
  };
});

const billsByMonth = computed(() => {
  let months = props.modelValue.powerprofile.reduce((acc, cur) => {
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
      bill: consumerBill(months[month_key], props.modelValue),
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
    demand: 0,
    tusd: 0,
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
  overview.demand = billsByMonth.value.reduce((acc, cur) => {
    return acc + cur.bill[1].old;
  }, 0);
  overview.tusd = billsByMonth.value.reduce((acc, cur) => {
    return acc + cur.bill[3].old - cur.bill[3].new;
  }, 0);
  return overview;
});

const monthReport = computed(() => {
  return billsByMonth.value.map((month) => {
    return {
      month: month.month,
      demand: month.bill[0].new - month.bill[0].old,
      consumption:
        month.bill[3].new -
        month.bill[3].old +
        month.bill[2].new -
        month.bill[2].old,
      peak: month.bill[3].new - month.bill[3].old,
      offpeak: month.bill[2].new - month.bill[2].old,
    };
  });
});

const bess_capacity_immediate = computed({
  get: () => props.modelValue.energy_capacity,
  set: (value) => {
    props.modelValue.value.energy_capacity = value;
    setTimeout(async function () {
      props.modelValue.value = await consumerBESS(props.modelValue);
    }, 0);
    // emit('update:model-value', value)
  },
});

onMounted(async () => {
  loaded.value = true;
});
</script>

<style></style>
