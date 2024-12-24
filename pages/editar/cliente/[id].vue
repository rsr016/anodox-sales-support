<template>
  <div>
    Editar projeto
    {{ client }}
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
})

const route = useRoute();
const supabase = useSupabaseClient();
const router = useRouter();

const { data: client } = await useAsyncData("client", async () => {
  const { data } = await supabase
    .from("clients")
    .select("*, projects(*)")
    .eq("id", route.params.id)
    .single();
  return data;
});

onMounted(async () => {
  if (!client.value) {
    router.push('/painel');
  }
});

</script>

<style>

</style>