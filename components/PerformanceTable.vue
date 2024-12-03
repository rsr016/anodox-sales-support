<template>
  <div class="container">
    <UTable :rows="performance" :columns="columns">
      <template #timestamp-data="{ row }">
        <NuxtTime :datetime="row.timestamp" year="numeric" month="numeric" day="numeric" hour="numeric" minute="numeric"
          class="mx-2" />
      </template>
    </UTable>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const columns = [
  {
    key: 'timestamp',
    label: 'Hora'
  },
  {
    key: 'aggregate',
    label: 'Total'
  }
];

</script>

<style></style>