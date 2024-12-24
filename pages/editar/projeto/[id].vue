<template>
  <div class="container mx-auto">
    <div
      class="flex top-24 sticky justify-left items-center z-40 bg-slate-50 p-5 mb-4"
    >
      <h1 class="text-2xl font-bold">Editar Projeto</h1>
      <p class="mx-3">{{ project_data.client.name }}</p>
      <p class="mx-3">{{ project_data.client.type }}</p>
      <p class="mx-3">{{ project_data.type }}</p>
      <UButton
        @click.prevent="saveProject"
        :disabled="!isChanged"
        class="link disabled:bg-slate-100 ml-auto mr-3"
        >Salvar</UButton
      >
      <UButton @click="router.push('/painel')" class="link mx-3">Painel</UButton>
      <UButton @click="router.push('/simula/' + project_data.id)" class="link">Simular</UButton>
    </div>
    <UDivider
      label="Projeto"
      :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
    />
    <form
      @submit.prevent="saveProject"
      class="grid grid-cols-3 grid-flow-row gap-4 my-5"
    >
      <div class="flex col-span-3 justify-between">
        <p>Dados Projeto</p>
      </div>
      <div v-for="(p, i) in project_form" :key="i" class="mb-4">
        <label class="block text-gray-700">{{ p.label }}</label>
        <UInput v-model="form[p.model]" />
      </div>
    </form>
    <UDivider
      label="Conta"
      :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
    />
    <form
      @submit.prevent="saveProject"
      class="grid grid-cols-3 grid-flow-row gap-4 my-5"
    >
      <div class="flex col-span-3 justify-between">
        <p>Dados Conta</p>
        <!-- <UButton type="submit" :disabled="!isChanged" class="btn-dark disabled:bg-slate-100">Salvar</UButton> -->
      </div>
      <div v-for="(p, i) in bill_form" :key="i" class="mb-4">
        <label class="block text-gray-700">{{ p.label }}</label>
        <UInput v-model="form[p.model]" />
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});

const loading = ref(true);
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const toast = useToast();

const form = ref({});

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
    label: "Demanda Contratada (kW)",
    model: "contracted_demand",
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

const bill_form = [
  {
    label: "Demanda Contratada (kW)",
    model: "contracted_demand",
  },
  {
    label: "Tarifa Demanda (R$/kW.mês)",
    model: "bill_tar_demand",
  },
  {
    label: "Ultrapassagem Demanda (kW)",
    model: "bill_amount_surcharge",
  },
  {
    label: "Multa Ultrapassagem (R$/kW.mês)",
    model: "bill_tar_surcharge",
  },
  {
    label: "TUSD Fora Ponta (R$/kWh)",
    model: "bill_amount_offpeaktusd",
  },
  {
    label: "TUSD Ponta (R$/kWh)",
    model: "bill_amount_peaktusd",
  },
  {
    label: "Tarifa Energia (R$/kWh)",
    model: "bill_tar_energy",
  },
  {
    label: "Tarifa TUSD Fora Ponta (R$/kWh)",
    model: "bill_tar_offpeaktusd",
  },
  {
    label: "Tarifa TUSD Ponta (R$/kWh)",
    model: "bill_tar_peaktusd",
  },
];

const { data: project_data } = await useAsyncData("project_data", async () => {
  const { data } = await supabase
    .from("projects")
    .select("*, consumptions(*), client:clients!inner(*)")
    .eq("id", route.params.id)
    .single();
  return data;
});

onMounted(() => {
  for (let formItem of project_form) {
    form.value[formItem.model] = project_data.value[formItem.model];
  }
  for (let formItem of bill_form) {
    form.value[formItem.model] = project_data.value[formItem.model];
  }
});

const isChanged = computed(() => {
  let changed = false;
  for (let property in form.value) {
    changed = changed || form.value[property] !== project_data.value[property];
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
      project_data.value[property] = form.value[property];
    }
  }
}
</script>

<style>
/* .inputField {
  @apply rounded-md border p-3 my-1 w-full;
} */
/* .btn-dark {
  @apply rounded-md border px-3 py-1 cursor-pointer hover:bg-gray-700 text-white;
} */
</style>
