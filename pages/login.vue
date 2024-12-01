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

onMounted( async () => {
    if (user.value) {
        setTimeout(500);
        router.push("/painel");
    }
});
</script>

<template>
    <div>
        <div v-if="!user.value">
            <form class="row flex-center flex" @submit.prevent="signIn">
                <div class="col-6 form-widget">
                    <h1 class="header">Anodox Sales Support</h1>
                    <p class="description">Plataforma interna para suporte de vendas</p>
                    <div>
                        <input class="inputField" type="email" placeholder="Your email" v-model="email" />
                    </div>
                    <div>
                        <input class="inputField" type="password" placeholder="Your password" v-model="password" />
                    </div>
                    <div>
                        <input type="submit" class="button block" :value="loading ? 'Acessando' : 'Login'" :disabled="loading" />
                    </div>
                    <div v-if="errorMsg" class="">
                        {{ errorMsg }}
                    </div>

                </div>
            </form>
        </div>
        <div v-else>
            Conectado como {{ user.email }}. Redirecionando.
        </div>
    </div>
</template>