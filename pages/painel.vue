<template>
  <div>
    {{ user.email }}    
    <button @click="logout" type="button" class="self-start btn mt-6">
      Logout
    </button>
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
</script>

<style>

</style>