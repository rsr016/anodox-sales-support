<template>
  <div>
  </div>
</template>

<script setup>
const router = useRouter();
definePageMeta({
    // redirect: router.push("/login")
})

onMounted(async () => {
    router.push("/login");
});

</script>

<style>

</style>