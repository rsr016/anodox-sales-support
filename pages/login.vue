<script setup>
const user = useSupabaseUser();

const client = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref(null);
const errorMsg = ref(null);

const loading = ref(false);

async function signIn() {
    try {
        loading.value = true;
        const { error } = await client.auth.signInWithPassword({
            email: email.value,
            password: password.value,
        });
        if (error) throw error;
        router.push("/painel")
    } catch (error) {
        errorMsg.value = error.message;
        loading.value = false;
    }
}

onMounted(async () => {
    if (user) {
        setTimeout(() => router.push("/painel"), 1500);
    }
});
</script>

<template>
    <div>
        <div class="flex justify-center container" v-if="!user">
            <form class="flex flex-center shadow-lg p-12 border rounded-lg row" @submit.prevent="signIn">
                <div class="form-widget p-6">
                    <h1 class="mb-5 font-bold header self-center">Anodox Sales Support</h1>
                    <p class="my-2 description self-center">Plataforma interna para suporte de vendas</p>
                    <input class="inputField" type="email" placeholder="Your email" v-model="email" />
                    <input class="inputField" type="password" placeholder="Your password" v-model="password" />
                    <div>
                        <input type="submit" class="block my-3 p-3 btn-light button" :value="loading ? 'Acessando' : 'Login'"
                            :disabled="loading" />
                    </div>
                    <div v-if="errorMsg" class="mx-auto my-0 p-0 text-red-700">
                        <span>{{ errorMsg }}</span>
                    </div>

                </div>
            </form>
        </div>
        <div v-else class="flex justify-center container">
            <div class="flex flex-center shadow-lg p-12 border rounded-lg row" @submit.prevent="signIn">
                <p>Conectado como {{ user.email }}. Redirecionando.</p>
            </div>
        </div>
    </div>
</template>