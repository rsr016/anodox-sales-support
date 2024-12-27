// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
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
    '@nuxt/ui',
    '@pinia/nuxt'
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
