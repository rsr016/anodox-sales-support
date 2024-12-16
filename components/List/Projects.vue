<template>
  <div class="border-b border-gray-200 pb-4">
    <div class="flex justify-between items-center">
      <div>
        <p class="font-bold text-gray-900">{{ client.name }}</p>
        <p class="text-gray-500">{{ client.type }}</p>
      </div>
      <div class="text-right">
        <NuxtTime
          :datetime="client.created_at"
          year="numeric"
          month="long"
          day="numeric"
        />
        <NuxtLink class="btn-light mt-2" :to="`/editar/cliente/${client.id}`"
          >Editar</NuxtLink
        >
      </div>
    </div>
    <div class="mt-4" v-if="client.projects.length > 0">
      <button @click="toggleProjects" class="flex items-center text-gray-500">
        <span>Projetos</span>
        <svg
          :class="{ 'transform rotate-180': showProjects }"
          class="w-5 h-5 ml-2 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div v-if="showProjects" class="mt-4 space-y-4">
        <div
          v-for="p in client.projects"
          :key="p.id"
          class="flex justify-between items-center border-t border-gray-200 pt-4"
        >
          <div>
            <NuxtTime
              :datetime="p.created_at"
              year="numeric"
              month="long"
              day="numeric"
            />
            <NuxtLink class="btn-light mt-2" :to="`/editar/projeto/${p.id}`"
              >Configurar</NuxtLink
            >
          </div>
          <div class="flex space-x-2">
            <NuxtLink class="btn-light" :to="`/simula/${p.id}`"
              >Simulação</NuxtLink
            >
            <NuxtLink class="btn-light" :to="`/relatorio/${p.id}`"
              >Relatório</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>
    <div v-else  class="mt-4 space-y-4">
      <span class="text-gray-500">Sem projetos registrados</span>
    </div>
  </div>
</template>

<style></style>

<script setup>
const props = defineProps({
  client: {
    type: Object,
    required: false,
  },
});

import { ref } from "vue";

const showProjects = ref(false);

function toggleProjects() {
  showProjects.value = !showProjects.value;
}
</script>
