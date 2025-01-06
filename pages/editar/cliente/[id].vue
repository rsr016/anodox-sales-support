<template>
  <div class="container">
    <div class="grid grid-cols-3">
      <div class="mx-4">
        <label for="name">Nome do cliente</label>
        <UInput v-model="client.name" label="Nome" :id="'name'" />
      </div>
      <div class="mx-4">
        <label for="type">Descrição</label>
        <UInput v-model="client.type" label="Tipo" :id="'type'" />
      </div>
      <UButton
        @click.prevent="saveProject"
        :disabled="!isChanged"
        class="link disabled:bg-slate-100 ml-auto mr-3"
        >Salvar</UButton
      >
    </div>
    <UDivider
      label="Projetos"
      :ui="{ label: 'text-primary-500 dark:text-primary-400 text-lg' }"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});

onBeforeRouteLeave((to, from) => {
  // Hard fix for components breaking when navigating to other pages
  loading.value = true;
});
onMounted(async () => {
  loading.value = false;

  formData.value.name = client.value.name;
  formData.value.type = client.value.type;
});

const route = useRoute();
const supabase = useSupabaseClient();
const router = useRouter();

const formData = ref({
  name: "",
  type: "",
});

const isChanged = computed(() => {
  let changed =
    formData.value.name !== client.value.name ||
    formData.value.type !== client.value.type;
  return changed;
});

async function saveProject() {
  // const { error } = await supabase
  //   .from("projects")
  //   .update(form.value)
  //   .eq("id", route.params.id);
  // if (error) {
  //   toast.add({
  //     title: "Erro",
  //     description: "Falha ao atualizar projeto: " + error.message,
  //     type: "error",
  //   });
  // } else {
  //   toast.add({
  //     title: "Sucessso",
  //     description: "Projeto atualizado...",
  //     type: "success",
  //   });
  //   for (let property in form.value) {
  //     project_data.value[property] = form.value[property];
  //   }
  // }
}

const { data: client } = await useAsyncData("client", async () => {
  const { data } = await supabase
    .from("clients")
    .select("*, projects(*)")
    .eq("id", route.params.id)
    .single();
  return data;
});

onMounted(async () => {
  if (!client.value) {
    router.push("/painel");
  }
});
</script>

<style></style>
