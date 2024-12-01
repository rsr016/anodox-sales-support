// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxt/image', '@nuxtjs/tailwindcss'],
  css: ['@/assets/main.css'],
  supabase: {
    redirect: false
  }    
})