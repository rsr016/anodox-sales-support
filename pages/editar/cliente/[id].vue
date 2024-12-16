<template>
  <div>
    {{ project?.value }}
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
})

const loading = ref(true);
const route = useRoute();
const client = useSupabaseClient();

const { data: project } = await useAsyncData('project', async () => {
  const { data } = await client.from('projects').select().eq('id', route.params.id);
  return data[0]
})

</script>

<style>

</style>