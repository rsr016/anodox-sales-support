<template>
  <div class="container flex-col items-center text-sm">
    <div
      v-for="project in projects"
      :key="project.id"
      class="flex justify-between px-3 py-3.5 my-auto"
    >
      <div class="min-w-60">
        <p class="text-gray-500">{{ project.solution_type }}</p>
        <p class="text-gray-400">{{ project.type }}</p>
      </div>
      <!-- <p class="text-gray-600 my-auto">{{ project.solution_type }}</p>
      <p class="text-gray-600 my-auto">{{ project.type }}</p> -->
      <p class="text-gray-500 my-auto">
        Criado: {{ format(new Date(project.created_at), "d-MMM-yy") }}
      </p>
      <p class="text-gray-500 my-auto">
        {{ project.energy_capacity }} kWh / {{ project.output_rating }} kW
      </p>
      <div>
        <button class="btn-light mx-1" @click="router.push('/projeto/' + project.id)">
          Detalhes
        </button>
        <!-- <button
          class="btn-light mx-1"
          @click="router.push('/projeto/' + project.id)"
        >
          Relatório
        </button>
        <button
          class="btn-light mx-1"
          @click="router.push('/projeto/' + project.id)"
        >
          Editar
        </button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from "date-fns";
const router = useRouter();

const props = defineProps({
  projects: {
    type: Array,
    required: false,
  },
});
</script>

<style></style>
