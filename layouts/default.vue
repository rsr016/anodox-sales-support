<template>
    <div>
        <header class="top-0 z-50 fixed flex flex-no-wrap bg-[--custom-bg-color] shadow-lg py-3 w-full">
            <nav class="flex justify-between mx-auto p-4 container" v-if="user">
                <NuxtImg src="/anodox-logo-white_1.avif" />
                <ul class="flex gap-4">
                    <li class="my-auto">
                        <NuxtLink to="/painel">Painel</NuxtLink>
                    </li>
                    <li class="my-auto">
                        <button @click="logout" type="button" class="btn-dark self-start">
                            Logout
                        </button>
                    </li>
                    <li class="sm:flex hidden my-auto">
                        <span>{{ user.email }}</span>
                    </li>
                </ul>
            </nav>
            <nav class="flex justify-left mx-auto p-4 container" v-else>
                <NuxtImg src="/anodox-logo-white_1.avif" />
            </nav>
        </header>
    </div>

    <div class="mx-auto mt-24 p-4 container">
        <slot />
    </div>

</template>

<script setup>
const user = useSupabaseUser();
const router = useRouter();
const client = useSupabaseClient();

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