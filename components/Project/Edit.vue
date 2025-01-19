<template>
  <div>
    <div
      class="grid grid-cols-2 top-24 sticky justify-between items-center z-40 bg-slate-50"
    >
      <!-- <div class="grid grid-cols-2">
        <div class="col-span-2 grid-flow-row flex">
          <h2 class="text-xl font-bold">{{ modelValue.client.name }}</h2>
          <p class="mx-4 my-auto">{{ modelValue.client.type }}</p>
        </div>
      </div> -->
      <div class="flex justify-right" v-if="isChanged" >
        <UButton
          @click.prevent="saveProject"
          :disabled="!isChanged"
          class="link disabled:bg-slate-100 ml-auto mr-3"
          >Salvar</UButton
        >
        <!-- <UButton @click="router.push('/painel')" class="link mx-3"
          >Painel</UButton
        >
        <UButton @click="router.push('/simula/' + modelValue.id)" class="link"
          >Simular</UButton
        > -->
      </div>
    </div>
    <UDivider
      label="Descritivo"
      :ui="divUi"
    />
    <div class="px-5 my-2">
      <div class="col-span-2 grid-flow-row flex my-1">
        <p class="my-auto mr-3">Descrição:</p>
        <UTextarea
          autoresize
          placeholder="Adicionar descrição..."
          :rows="1"
          v-model="form.type"
          class="w-full"
        />
      </div>
    </div>

    <div class="px-5">
      <div class="col-span-2 grid-flow-row flex my-1">
        <p class="my-auto mr-3">Tipo de projeto:</p>
        <USelect
          v-model="form.solution_type"
          :options="modelValue.solutions.map((x) => x.type)"
        />
        <span class="text-sm font-light my-auto mx-4">{{
          form.solution_type
            ? modelValue.solutions.filter(
                (x) => x.type == form.solution_type
              )[0].description
            : null
        }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2">
      <div class="col-span-1 p-4">
        <UDivider
          label="Projeto"
          :ui="divUi"
        />
        <UTable :rows="project_form" :ui="tableConfig">
          <template #model-data="{ row }">
            <UInput v-model="form[row.model]" type="number" />
          </template>
        </UTable>
      </div>
      <div class="col-span-1 p-4">
        <UDivider
          label="Conta"
          :ui="divUi"
        />

        <UTable
          :rows="bill_table.rows"
          :columns="bill_table.columns"
          :ui="tableConfig"
        >
          <template #label-data="{ row }">
            <p class="my-1 text-bold">
              {{ row.label }}
            </p>
            <div v-if="row.type === 'row'" class="grid grid-flow-row">
              <div v-for="f in row.items" class="row-start-1 m-1">
                <div>{{ f.label }}</div>
                <UInput v-model="form[f.model]" type="number" />
              </div>
            </div>
            <div v-else-if="row.type === 'list'">
              <UTable :rows="row.items" :ui="tableConfig">
                <template #model-data="{ row }">
                  <UInput v-model="form[row.model]" type="number" />
                </template>
              </UTable>
            </div>
          </template>
        </UTable>
      </div>
    </div>

    <UDivider
      label="Dados simulação"
      :ui="divUi"
    />
    <CreateData :project_data="modelValue" />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const form = ref({});
const isNew = ref(false);

const divUi = {
  wrapper: {
    base: "my-5",
  },
  label: "text-primary-500 dark:text-primary-400 text-lg",
};

const project_form = [
  {
    label: "Capacidade de Energia (kWh)",
    model: "energy_capacity",
  },
  {
    label: "Potência de Saída (kW)",
    model: "output_rating",
  },
  {
    label: "Perdas de Carga (%)",
    model: "charge_losses",
  },
  {
    label: "Perdas de Descarga (%)",
    model: "discharge_losses",
  },
  {
    label: "SoC Mínimo (%)",
    model: "min_soc",
  },
  {
    label: "SoC Máximo (%)",
    model: "max_soc",
  },
];

const bill_table = {
  rows: [
    {
      label: "Demanda (R$/kW/mês)",
      type: "list",
      items: [
        {
          label: "Demanda Contratada (kW)",
          model: "contracted_demand",
        },
        {
          label: "Tarifa",
          model: "bill_tar_demand",
        },
        {
          label: "Multa Ultrapassagem",
          model: "bill_tar_surcharge",
        },
        {
          label: "Subvenção",
          model: "bill_subvention_demand",
        },
      ],
    },
    {
      label: "TUSD (R$/kWh)",
      type: "list",
      items: [
        {
          label: "Ponta",
          model: "bill_tar_peaktusd",
        },
        {
          label: "Fora Ponta",
          model: "bill_tar_offpeaktusd",
        },
        {
          label: "Subvenção",
          model: "bill_subvention_tusd",
        },

        {
          label: "Custo Energia",
          model: "bill_tar_energy",
        },
      ],
    },
  ],
  columns: [
    {
      key: "label",
    },
  ],
};

const bill_form = [
  {
    label: "Demanda Contratada (kW)",
    model: "contracted_demand",
  },
  {
    label: "Ultrapassagem Demanda (kW)",
    model: "bill_amount_surcharge",
  },
  {
    label: "Tarifa Demanda (R$/kW.mês)",
    model: "bill_tar_demand",
  },
  {
    label: "Multa Ultrapassagem (R$/kW.mês)",
    model: "bill_tar_surcharge",
  },
  {
    label: "Subvenção Demanda (R$/kW.mês)",
    model: "bill_subvention_demand",
  },

  {
    label: "TUSD Fora Ponta (kWh)",
    model: "bill_amount_offpeaktusd",
  },
  {
    label: "Tarifa TUSD Fora Ponta (R$/kWh)",
    model: "bill_tar_offpeaktusd",
  },
  {
    label: "TUSD Ponta (kWh)",
    model: "bill_amount_peaktusd",
  },
  {
    label: "Tarifa TUSD Ponta (R$/kWh)",
    model: "bill_tar_peaktusd",
  },
  {
    label: "Subvenção TUSD (R$/kWh)",
    model: "bill_subvention_tusd",
  },

  {
    label: "Tarifa Energia (R$/kWh)",
    model: "bill_tar_energy",
  },
];

const tableConfig = {
  base: "justify-self-center my-3",
  divide: "divide-y divide-gray-300 dark:divide-gray-700",
  th: {
    base: "hidden",
  },
  td: {
    base: "justify-self-center",
    class: "justify-self-center",
    padding: "px-6 py-1",
    color: "text-gray-600 dark:text-gray-400",
  },
  tr: {
    base: "hover:bg-slate-200",
  },
};

const isChanged = computed(() => {
  let changed = false;
  for (let property in form.value) {
    changed = changed || form.value[property] !== props.modelValue[property];
  }
  return changed;
});

async function saveProject() {
  const { error } = await supabase
    .from("projects")
    .update(form.value)
    .eq("id", route.params.id);

  if (error) {
    toast.add({
      title: "Erro",
      description: "Falha ao atualizar projeto: " + error.message,
      type: "error",
    });
  } else {
    toast.add({
      title: "Sucessso",
      description: "Projeto atualizado...",
      type: "success",
    });
    for (let property in form.value) {
      props.modelValue[property] = form.value[property];
    }
    isNew.value = false;
  }
}

onMounted(() => {
  // console.log(props.modelValue);
  // console.log(props.modelValue.value);
  for (let formItem of project_form) {
    form.value[formItem.model] = props.modelValue[formItem.model];
  }
  for (let formItem of bill_form) {
    form.value[formItem.model] = props.modelValue[formItem.model];
  }

  // // Manual insertion of additional fields
  form.value.solution_type = props.modelValue.solution_type;
  form.value.type = props.modelValue.type;
});
</script>

<style></style>
