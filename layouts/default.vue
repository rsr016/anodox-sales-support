<template>
    <div>
        <header class="bg-[--custom-bg-color] shadow-lg py-3">
            <nav class="flex justify-between mx-auto p-4 container" v-if="user">
                <span>
                    Logo Aqui
                </span>
                <ul class="flex gap-4">
                    <li class="my-auto">
                        <NuxtLink to="/painel">Painel</NuxtLink>
                    </li>
                    <li>
                        <button @click="logout" type="button" class="btn-dark self-start">
                            Logout
                        </button>
                    </li>
                    <li class="my-auto">
                        <span>{{ user.email }}</span>
                    </li>
                </ul>
            </nav>
            <nav class="flex justify-left mx-auto p-4 container" v-else>
                <span>
                    Logo Aqui
                </span>
            </nav>
        </header>
    </div>

    <div class="mx-auto mt-3 p-4 container">
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