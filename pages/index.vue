<template>
  <div>
    Index
  </div>
</template>

<script setup>
const router = useRouter();
definePageMeta({
    // redirect: ["login"]
})

onMounted(async () => {
    router.push("/login");
});

</script>

<style>

</style>