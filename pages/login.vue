<script setup>
const supabase = useSupabaseClient()

const loading = ref(false)
const email = ref('')
const password = ref(null);

const errorMsg = ref(null);
const successMsg = ref(null);

const handleLogin = async () => {
    try {
        loading.value = true
        const { error } = await supabase.auth.signInWithOtp({ email: email.value })
        if (error) throw error
        alert('Check your email for the login link!')
    } catch (error) {
        alert(error.error_description || error.message)
    } finally {
        loading.value = false
    }
}

async function signUp() {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
        });
        if (error) throw error;
        successMsg.value = "Check your email to confirm your account"
    } catch (error) {
        errorMsg.value = error.message;
    }
}
</script>

<template>
    <form class="row flex-center flex" @submit.prevent="handleLogin">
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
        </div>
    </form>
</template>