<template>
  <div>
    <p>User ID: {{ $route.params.id }}</p>
    <p>Project ID: {{ project.id }}</p>
    <p class="my-4">Time data</p>
    <!-- <div>
      <ul>
        <li v-for="cons in performance">
          {{ cons.timestamp }} - {{ cons.aggregate }}
        </li>
      </ul>
    </div> -->
    <div>
      <!-- {{ performance[270] }} -->
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
})
const user = useSupabaseUser();
const client = useSupabaseClient();
const route = useRoute();

// const performance = ref(null);


const { data: project } = await useAsyncData('project', async () => {
  const { data } = await client.from('projects').select().eq('client_id', route.params.id);
  return data[0]
})

const { data: performance } = await useAsyncData('performance', async () => {
  const { data } = await client.from('consumptions').select('timestamp, aggregate, peak, off_peak').eq('project_id', project.value.id);
  return data
})

const { data: tstamps_limits } = await useAsyncData('tstamps_limits', async () => {
  const { data } = await client.rpc('get_consumption_timestamps', {
    pid: project.value.id
  });
  return data
})

function consumerBESS() {
  
  performance.value.forEach((item, index, arr) => {

    var item = arr[index];
    item.contracted = project.value.contracted_demand;
    item.bess_capacity = project.value.energy_capacity;
    item.eff_charge = (100 - project.value.charge_losses) / 100;
    item.eff_discharge = (100 - project.value.discharge_losses) / 100;
    item.bess_min = project.value.min_soc * item.bess_capacity / 100;
    item.bess_max = project.value.max_soc * item.bess_capacity / 100;

    if (index == 0) {
      item.bess_energy = 0;
    } else {
      item.bess_energy = arr[index-1].bess_energy;
    }

    if (item.peak > 0) {
      item.power_available = 0;
      item.power_requested = item.peak;
    } else {
      item.power_available = Math.max(item.contracted - item.aggregate, 0);
      item.power_requested = Math.max(item.aggregate - item.contracted, 0);
    }

    if (item.power_available > 0) {
      item.bess_gross_charge = Math.min(item.power_available / 4, (item.bess_capacity - item.bess_energy) / item.eff_charge);
      item.bess_net_charge = item.bess_gross_charge * item.eff_charge;
      item.bess_gross_discharge = 0;
      item.bess_net_discharge = 0;

      item.bess_energy += item.bess_net_charge;
    } else if (item.power_requested > 0) {
      item.bess_gross_charge = 0;
      item.bess_net_charge = 0;
      item.bess_gross_discharge = Math.min(item.bess_energy, item.power_requested / 4 / item.eff_discharge);
      item.bess_net_discharge = item.bess_gross_discharge * item.eff_discharge;

      item.bess_energy -= item.bess_gross_discharge;
    }

    item.bess_soc = item.bess_energy / item.bess_capacity;
    
    arr[index] = item;
  });
}

onMounted( async () => {
    consumerBESS();
    // console.log(performance.value[270]);
});

</script>

<style></style>