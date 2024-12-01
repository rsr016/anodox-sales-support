<template>
  <div>
    <p>User ID: {{ $route.params.id }}</p>
    <p>Project ID: {{ project_id }}</p>
    <p class="my-4">Time data</p>
    <div>
      <ul>
        <li v-for="cons in consumptions">
          {{cons.timestamp}} - {{ cons.aggregate }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
    middleware: ["auth"],
})
const user = useSupabaseUser();
const client = useSupabaseClient();
const route = useRoute();

const project_id = ref(null);


const { data: projects } = await useAsyncData('projects', async () => {
  const { data } = await client.from('projects').select().eq('client_id', route.params.id);
  project_id.value = data[0].id
  return data
})

const { data: consumptions } = await useAsyncData('consumptions', async () => {
  const { data } = await client.from('consumptions').select().eq('project_id', project_id.value);
  return data
})

const { data: tstamps_limits } = await useAsyncData('tstamps_limits', async () => {
  const { data } = await client.rpc('get_consumption_timestamps', {
    pid: project_id.value
  });
  return data
})

</script>

<style>

</style>