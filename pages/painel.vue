<template>
  <div class="mx-6">
    <ul role="list" class=" container">
      <li class="container gap-x-6 py-5" v-for="c in list_data">
        <ListProjects :client="c" />
      </li>
    </ul>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});

const client = useSupabaseClient();

const { data: list_data } = await useAsyncData("list_data", async () => {
  const { data } = await client.from("clients").select('*, projects(*)');
  return data;
});


</script>

<style></style>
