// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/image',
    // '@nuxtjs/tailwindcss',
    'nuxt-time',
    // '@nuxt/icon',
    'nuxt-headlessui',
    '@vueuse/nuxt',
    'nuxt-lodash',
    '@morev/vue-transitions',
    'nuxt-plotly',
    'nuxt-highcharts',
    '@nuxt/ui'
  ],
  plugins: [
    // Ensure this runs on client side only
    { src: '~/plugins/highcharts.client.js', mode: 'client' }
  ],
  tailwindcss: { exposeConfig: true },
  headlessui: {
    prefix: 'H'
  },
  css: ['@/assets/main.css'],
  supabase: {
    redirect: false
  },
  vite: {
    optimizeDeps: {
      include: ['plotly.js-dist-min']
    }
  }
})
