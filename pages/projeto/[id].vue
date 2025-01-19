<template>
  <LoadingIndicator v-if="loading" />
  <div v-else class="container mx-auto">
    <UTabs :items="pageSections" class="w-full my-5">
      <template #edit="{ item }"> <ProjectEdit v-model="project_data" /> </template>
      <template #simulate="{ item }"> <ProjectSimulate v-model="project_data" :date-limits="dateRangeLimits"/> </template>
      <template #report="{ item }"> <ProjectReport v-model="project_data" :date-limits="dateRangeLimits"/> </template>
    </UTabs>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});

onBeforeRouteLeave((to, from) => {
  // Hard fix for components breaking when navigating to other pages
  // loading.value = true;
});
onMounted(async () => {
  // loading.value = false;
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const toast = useToast();

// const loading = ref(true);

const pageSections = [
  {
    slot: "edit",
    label: "Editar",
  },
  {
    slot: "simulate",
    label: "Simular",
  },
  {
    slot: "report",
    label: "Relatório",
  },
];

const loading = computed(() => {
  if (!project_data?.value) return true;
  return false;
});

const { data: project_data } = await useAsyncData("project_data", async () => {
  let projectId = null;
  if (route.params.id.includes("novo")) {
    let clientId = route.params.id.split("_")[1];

    isNew.value = true;
    let projectData = {
      client_id: clientId,
    };
    const { data, error } = await supabase
      .from("projects")
      .insert([projectData])
      .select("id")
      .single();

    if (error) {
      toast.add({
        title: "Erro",
        description: "Falha ao criar projeto: " + error.message,
        type: "error",
      });
    } else {
      toast.add({
        title: "Sucessso",
        description: "Projeto criado...",
        type: "success",
      });
      projectId = data.id;
      router.push("/editar/projeto/" + projectId);
    }
  } else {
    projectId = route.params.id;
  }

  const { data } = await supabase
    .from("projects")
    .select("*, powerprofile(*), client:clients!inner(*), solutions(*)")
    .eq("id", projectId)
    .single();
  const { data: solutions } = await supabase.from("solutions").select("*");
  data.solutions = solutions;
  // loading.value = false;
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
</script>

<style></style>
