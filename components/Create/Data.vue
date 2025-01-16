<template>
  <div class="container mt-4">
    <form
      @submit.prevent="handleFileUpload"
      class="flex gap-3 content-stretch justify-center"
    >
      <UInput type="file" accept=".csv" @change="handleFileChange" />
      <UButton type="submit" :disabled="!file">Upload</UButton>
    </form>
    <UModal v-model="selectingColumns">
      <div class="">
        <UTable :rows="rows" :columns="columns">
          <template #mapping-data="{ row }">
            <USelect
              v-model="row.mapping"
              :options="columnMappingSelection"
              option-attribute="name"
              placeholder="Selecionar coluna..."
            />
          </template>
          <template #preview-data="{ row }">
            <pre>{{ row.mapping ? previewData(row.mapping) : "-" }}</pre>
          </template>
        </UTable>
        <div class="flex justify-between mx-3 my-3">
          <UButton @click="selectingColumns = false" color="red"
            >Cancelar</UButton
          >
          <UButton @click="uploadParsed" color="green"
            >Upload/Substituir</UButton
          >
        </div>
      </div>
    </UModal>
    <div>
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="props.project_data.powerprofile.length"
        class="container"
        :ui="{
          wrapper: 'flex items-center gap-1 justify-center',
          base: 'mt-5',
          rounded: '!rounded-full min-w-[32px] justify-center',
          default: {
            activeButton: {},
          },
        }"
      />
      <UTable :rows="projectRows" :columns="projectColumns" :ui="tableConfig">
        <template #timestamp-data="{ row }">
          <NuxtTime
            :datetime="row.timestamp"
            year="numeric"
            month="numeric"
            day="numeric"
            hour="numeric"
            minute="numeric"
            class="mx-2"
          />
        </template>
      </UTable>
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="props.project_data.powerprofile.length"
        class="container"
        :ui="{
          wrapper: 'flex items-center gap-1 justify-center',
          base: 'mt-5',
          rounded: '!rounded-full min-w-[32px] justify-center',
          default: {
            activeButton: {},
          },
        }"
      />
    </div>
  </div>
</template>

<script setup>
const toast = useToast();
const supabase = useSupabaseClient();
import { parse } from "date-fns";

const file = ref(null);
const parsedFile = ref(null);
const selectingColumns = ref(false);

const props = defineProps({
  project_data: {
    type: Object,
    required: true,
  },
});

const rows = ref([
  { name: "Dia", value: "date", mapping: null, preview: null },
  { name: "Hora", value: "hour", mapping: null, preview: null },
  { name: "Total (kW)", value: "power_cons_total", mapping: null, preview: null },
  { name: "Ponta (kW)", value: "power_cons_peak", mapping: null, preview: null },
  { name: "Fora Ponta (kW)", value: "power_cons_offpeak", mapping: null, preview: null },
  { name: "Queda (kW)", value: "power_outage", mapping: null, preview: null },
  { name: "Geração (kW)", value: "power_gen", mapping: null, preview: null },
  { name: "Restrição (kW)", value: "power_constraint", mapping: null, preview: null },
]);
const columns = [
  {
    key: "name",
    label: "Coluna",
  },
  {
    key: "mapping",
    label: "Mapeamento",
  },
  {
    key: "preview",
    label: "Prévia",
  },
];

const page = ref(1);
const pageCount = ref(20);

const tableConfig = {
  wrapper: "overflow-x-auto",
  base: "justify-self-center table-auto min-w-0",
  divide: "divide-y divide-gray-300 dark:divide-gray-700",
  td: {
    base: "whitespace-nowrap text-center border",
    padding: "px-4 py-4",
  },
  tr: {
    base: "hover:bg-slate-200",
  },
};

const projectRows = computed(() => {
  return props.project_data.powerprofile.slice(
    (page.value - 1) * pageCount.value,
    page.value * pageCount.value
  );
});

const projectColumns = [
  {
    key: "timestamp",
    label: "Hora",
  },
  {
    key: "power_cons_total",
    label: "Total (kW)",
  },
  {
    key: "power_cons_peak",
    label: "Ponta (kW)",
  },
  {
    key: "power_cons_offpeak",
    label: "Fora Ponta (kW)",
  },
  {
    key: "power_outage",
    label: "Queda (kW)",
  },

  {
    key: "power_gen",
    label: "Geração (kW)",
  },
  {
    key: "power_constraint",
    label: "Restrição (kW)",
  },
];

function previewData(key) {
  return parsedFile.value?.data.slice(0, 3).map((r) => r[key]);
}

const columnMappingSelection = computed(() => {
  return parsedFile.value?.meta.fields.map((f) => ({
    name: f,
    value: f,
    disabled: rows.value.reduce((acc, row) => acc || row.mapping === f, false),
  }));
});

const selectedConsumptions = computed(() => {
  let powerprofile = [];

  parsedFile.value?.data.forEach((f) => {
    if (
      f[rows.value[0].mapping] &&
      f[rows.value[1].mapping] &&
      f[rows.value[2].mapping] &&
      f[rows.value[3].mapping] &&
      f[rows.value[4].mapping]
    ) {
      let row = {
        project_id: props.project_data.id,
        timestamp: parse(
          f[rows.value[0].mapping].replace("00:00", "") + " " +  f[rows.value[1].mapping] + ":00",
          "dd/MM/yyyy HH:mm",
          new Date()
        ),
        power_cons_total: f[rows.value[2].mapping].replace(",", "."),
        power_cons_peak: f[rows.value[3].mapping].replace(",", "."),
        power_cons_offpeak: f[rows.value[4].mapping].replace(",", "."),

        power_outage: f[rows.value[5].mapping].replace(",", "."),
        power_gen: f[rows.value[6].mapping].replace(",", "."),
        power_constraint: f[rows.value[7].mapping].replace(",", "."),
      };
      powerprofile.push(row);
    }
  });

  return powerprofile;
});

const handleFileChange = (event) => {
  if (event.length > 0) {
    file.value = event[0];
  } else {
    file.value = null;
  }
};

const handleFileUpload = async () => {
  try {
    const csvData = await parseCSV(file.value);
    parsedFile.value = csvData;
    selectingColumns.value = true;
  } catch (error) {
    toast.add({
      title: "Erro",
      description: "Falha ao criar projeto: " + error.message,
      type: "error",
    });
  }
};

const uploadParsed = async () => {
  selectingColumns.value = false;
  props.project_data.powerprofile = selectedConsumptions.value;
  await uploadDataToSupabase();
};
const uploadCancel = async () => {
  selectingColumns.value = false;
};

const uploadDataToSupabase = async () => {
  selectingColumns.value = false;
  try {
    // Delete existing data related to the project_id
    const { error: deleteError } = await supabase
      .from("powerprofile")
      .delete()
      .eq("project_id", props.project_data.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new data
    const { error: insertError } = await supabase
      .from("powerprofile")
      .insert(selectedConsumptions.value);

    if (insertError) {
      throw insertError;
    }

    toast.add({
      title: "Success",
      description: "Data uploaded successfully",
      type: "success",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to upload data: " + error.message,
      type: "error",
    });
  }
};
</script>

<style></style>
