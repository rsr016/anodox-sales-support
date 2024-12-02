<template>
  <div class="mx-6">
    <!-- <table class="container table-auto">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Tipo</th>
          <th>Data</th>
          <th>Simulação</th>
          <th>Relatório</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in clients">
          <td>{{ c.name }}</td>
          <td>{{ c.type }}</td>
          <td>{{ c.created_at.slice(0, 10) }}</td>
          <td>
            <NuxtLink :to="`/simula/${c.id}`">Simulação</NuxtLink>
          </td>
          <td>
            <NuxtLink :to="`/simula/${c.id}`">Relatório</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table> -->
    <ul role="list" class="divide-y divide-gray-300">
      <li class="flex justify-between gap-x-6 py-5" v-for="c in clients">
        <div class="flex gap-x-4 min-w-0">
          <div class="flex-auto min-w-0">
            <p class="font-semibold text-gray-900">{{ c.name }}</p>
            <p class="my-2 pl-1 text-gray-500 truncate">{{ c.type }}</p>
            <button class="text-gray-500 btn-light">Configurar</button>
          </div>
        </div>
        <div class="sm:flex sm:flex-col sm:items-end hidden shrink-0">
          <p class="my-auto text-gray-900"><NuxtTime :datetime="c.created_at" year="numeric" month="long" day="numeric" /></p>
          <p class="justify-between my-auto text-gray-500"><NuxtLink class="btn-light" :to="`/simula/${c.id}`">Simulação</NuxtLink> <NuxtLink class="btn-light" :to="`/simula/${c.id}`">Relatório</NuxtLink></p>
        </div>
      </li>
    </ul>

  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
})

const client = useSupabaseClient();

const { data: clients } = await useAsyncData('clients', async () => {
  const { data } = await client.from('clients').select();

  return data
})
</script>

<style></style>