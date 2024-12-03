import { defineNuxtPlugin } from '#app';
import Highcharts from 'highcharts';
import HighchartsVue from 'highcharts-vue';
import stockInit from 'highcharts/modules/stock';

export default defineNuxtPlugin({
   name: 'highcharts-vue',
   parallel: true,
   setup (nuxtApp) {
       if (typeof Highcharts === 'object') {
           stockInit(Highcharts);
       }
       nuxtApp.vueApp.use(HighchartsVue);
   }
});