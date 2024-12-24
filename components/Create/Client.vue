<template>
  <div>
    <button @click="showPopup = true" class="btn-light">Novo Cliente</button>
    <div v-if="showPopup" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Criar Cliente</h2>
        <form @submit.prevent="saveClient">
          <div class="mb-4">
            <label for="name" class="block text-gray-700">Nome</label>
            <input type="text" id="name" v-model="client.name" class="inputField" required />
          </div>
          <div class="mb-4">
            <label for="type" class="block text-gray-700">Tipo</label>
            <input type="text" id="type" v-model="client.type" class="inputField" required />
          </div>
          <div class="flex justify-between mt-3">
            <button type="button" @click="showPopup = false" class="btn-light">Cancelar</button>
            <button type="submit" class="btn-light">Criar</button>
          </div>
        </form>
        <h3 v-if="error" class="text-red-500 mt-4">{{ error }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>

const supabase = useSupabaseClient();
const router = useRouter();
const toast = useToast();

const showPopup = ref(false);
const error = ref(null);
const client = ref({name: '', type: ''});

async function saveClient() {
  const { data, error } = await supabase
    .from('clients')
    .insert(client.value, { onConflict: ['id'] })
    .select();

  if (error) {
    toast.add({ title: 'Erro', description: 'Falha ao criar cliente: ' + error.message, type: 'error' });
  } else {
    toast.add({ title: 'Sucessso', description: 'Cliente criado, redirecionando...', type: 'success' });
    showPopup.value = false;
    router.push(`/editar/cliente/${data[0].id}`)
  }
}
</script>

<style>
.inputField {
  @apply rounded-md border p-3 my-1 w-full;
}
.btn-light {
  @apply rounded-md border px-3 py-1 cursor-pointer hover:bg-gray-200;
}
.btn-dark {
  @apply rounded-md border px-3 py-1 cursor-pointer hover:bg-gray-700 text-white;
}
</style>