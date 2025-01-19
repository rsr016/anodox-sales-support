<template>
  <div v-if="loaded">
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
    <div class="top-24 z-40 sticky bg-gray-50 pb-2">
      <DatePickerBar
        v-model="dateRange"
        :start="dateLimits.min"
        :end="dateLimits.max"
      />
    </div>
    <ConsumerBillTable
      v-if="filtered_performance || filtered_performance.length > 0"
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
</template>

<script setup>
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

const dateRange = ref({ start: null, end: null });
const page = ref(1);
const loaded = ref(false);

const project_data = computed(() => {
  return props.modelValue;
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

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

const bess_capacity = computed({
  get: () => props.modelValue.energy_capacity,
  set: (value) => {
    props.modelValue.value.energy_capacity = value;
    setTimeout(async function () {
      props.modelValue.value = await consumerBESS(props.modelValue);
    }, 1000);
    // emit('update:model-value', value)
  },
});

onMounted(async () => {
  dateRange.value = {
    start: new Date(props.dateLimits.min),
    end: addDays(new Date(props.dateLimits.min), 7),
  };
  props.modelValue.value = await consumerBESS(props.modelValue);
  loaded.value = true;
});
</script>

<style></style>
