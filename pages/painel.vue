<template>
  <div class="container mx-6">
    <div
      class="flex justify-between px-3 py-3.5 border-b border-gray-200 dark:border-gray-700"
    >
      <UInput v-model="q" placeholder="Buscar cliente..." />
      <CreateClient />
    </div>

    <UTable
      v-model:expand="expand"
      :rows="filteredRows"
      :columns="columns"
      :ui="{ base: 'table-auto' }"
    >
      <template #expand="{ row }">
        <div class="bg-slate-100">
          <ListProjects :projects="row.projects" />
        </div>
      </template>
      <template #name-data="{ row }">
        <p class="font-bold text-gray-900">{{ row.name }}</p>
        <p class="text-gray-500">{{ row.type }}</p>
      </template>
      <template #created_at-data="{ row }">
        <NuxtTime
          :datetime="row.created_at"
          year="numeric"
          month="long"
          day="numeric"
        />
      </template>
      <template #projects-data="{ row }">
        <span class="my-auto">
          {{ row.projects.length > 0 ? row.projects.length : "-" }}
        </span>
      </template>
      <template #action-data="{ row }">
        <div class="grid grid-flow-col shrink align-middle justify-between">
          <UButton
            icon="i-heroicons-document-plus"
            :label="'Novo Projeto'"
            @click="router.push(`/projeto/novo_${row.id}`)"
            class=""
          />
          <UButton
            @click="router.push(`/editar/cliente/${row.id}`)"
            icon="i-heroicons-pencil-square"
            :label="'Editar Cliente'"
          />
        </div>
      </template>
    </UTable>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const client = useSupabaseClient();

const { data: list_data } = await useAsyncData("list_data", async () => {
  const { data } = await client.from("clients").select("*, projects(*)");
  return data;
});

const q = ref(null);

const expand = ref({
  openedRows: [null],
  row: {},
});

const filteredRows = computed(() => {
  let list = list_data.value;

  list.forEach((client) => {
    if (client.projects.length === 0) {
      client.disabledExpand = true;
    }
  });

  if (!q.value) {
    return list;
  }

  return list.filter((client) => {
    return Object.values(client).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});

const columns = [
  {
    key: "name",
    label: "Cliente",
    class: "text-bold",
  },
  {
    key: "created_at",
    label: "Data",
  },
  {
    key: "projects",
    label: "Projetos",
  },
  {
    key: "action",
    label: "Ação",
  },
];
</script>

<style></style>
