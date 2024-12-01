<template>
  <div>
    <div>
      {{ user.email }}    
      <button @click="logout" type="button" class="self-start btn mt-6">
        Logout
      </button>
    </div>
    <div>
      <ul>
        <li v-for="c in clients">
          {{ c.name  }} <NuxtLink :to="`/simula/${c.id}`">{{ c.id }}</NuxtLink>
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
const router = useRouter();

async function logout() {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    router.push("/login");
  } catch (error) {
    console.log(error.message);
  }
}

const { data: clients } = await useAsyncData('clients', async () => {
  const { data } = await client.from('clients').select();

  return data
})
</script>

<style>

</style>