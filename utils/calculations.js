import colors from "#tailwind-config/theme/colors";
import { parseISO  } from "date-fns";

export const findPeaks = (data) => {
  let peaks = data.map((d) => d.power_grid_peak == 0 ? 0 : (d.power_grid_peak * d.power_cons - d.service_from_bess > 0 ? 1 : -1));

  let bands = new Array();

  for (let i = 0; i < peaks.length; i++) {
    let curr = data[i];
    let prev = data[i];

    if (i == 0) {
      // Register starts, just in case
      if (peaks[i] == 1) {
        bands.push({ from: Date.parse(curr.timestamp) });
      } else if (peaks[i] == -1) {
        bands.push({ from: Date.parse(curr.timestamp) })
      }
    } else {
      prev = data[i - 1]

      // Register ends
      if (peaks[i] != 1 && peaks[i - 1] == 1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.rose[100];
      } else if (peaks[i] != -1 && peaks[i - 1] == -1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.green[100];
      }

      // Register starts
      if (peaks[i] == 1 && peaks[i - 1] != 1) {
        bands.push({ from: Date.parse(prev.timestamp) });
      } else if (peaks[i] == -1 && peaks[i - 1] != -1) {
        bands.push({ from: Date.parse(prev.timestamp) })
      }
    }

    if (i == peaks.length - 1) {
      // Check last index to close final band
      if (peaks[i] == 1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.rose[100];
      } else if (peaks[i] == -1) {
        bands[bands.length - 1].to = Date.parse(curr.timestamp);
        bands[bands.length - 1].color = colors.green[100];
      }
    }
  }
  return bands;
};

export const consumerBESS = async (data) => {
  let t1 = data.powerprofile[0].timestamp;
  let t2 = data.powerprofile[1].timestamp;
  // 3600000 ms in an hour, compare to actual ms elapsed between timestamps
  let time_factor = 3600000 / (parseISO(t2) - parseISO(t1));

  let sendout_limit = data.output_rating; // Power

  data.powerprofile.forEach((item, index, arr) => {
    var item = arr[index];
    item.contracted = data.contracted_demand; // Power
    item.bess_capacity = data.energy_capacity; // Energy
    item.eff_charge = (100 - data.charge_losses) / 100;
    item.eff_discharge = (100 - data.discharge_losses) / 100;
    item.bess_min = (data.min_soc * item.bess_capacity) / 100; // Energy
    item.bess_max = (data.max_soc * item.bess_capacity) / 100; // Energy

    if (index == 0) {
      item.bess_energy = 0; // Energy
      item.bess_cycles = 0;
    } else {
      item.bess_energy = arr[index - 1].bess_energy; // Energy
      item.bess_cycles = arr[index - 1].bess_cycles;
    }

    // Check if is peak
    if (item.power_grid_peak > 0) {
      item.power_available = 0; // Power
      item.power_requested = item.power_cons * item.power_grid_peak; // Power
    } else {
      item.power_available = Math.max(item.contracted - item.power_cons, 0); // Power
      item.power_requested = Math.max(item.power_cons - item.contracted, 0); // Power
    }

    if (item.power_available > 0) {
      item.service_to_bess = Math.min(
        (item.bess_max - item.bess_energy) / item.eff_charge * time_factor, // Capacity still available in BESS
        item.power_available, // Power available from grid
        sendout_limit // Power limit
      ); // Power
      item.service_from_bess = 0; // Power
    } else if (item.power_requested > 0) {
      item.service_to_bess = 0; // Power
      item.service_from_bess = Math.min(
        (item.bess_energy - item.bess_min) * item.eff_discharge * time_factor, // Available energy stored in BESS
        item.power_requested, // Power requested by consumer
        sendout_limit // Power limit
      ); // Power
    }
    item.service_grid = item.power_cons - item.service_from_bess + item.service_to_bess; // Power

    item.bess_gross_charge = item.service_to_bess / time_factor; // Energy from power
    item.bess_net_charge = item.bess_gross_charge * item.eff_charge; // Energy
    item.bess_net_discharge = item.service_from_bess / time_factor; // Energy from power
    item.bess_gross_discharge = item.bess_net_discharge / item.eff_discharge; // Energy

    item.bess_energy = item.bess_energy + item.bess_net_charge - item.bess_gross_discharge; // Energy

    item.bess_soc = item.bess_energy / item.bess_capacity;
    item.bess_cycles += item.bess_gross_discharge / item.bess_capacity;

    arr[index] = item;
  });

  return data;
};

export const consumerBill = (perf, proj) => {
  let t1 = perf[0].timestamp;
  let t2 = perf[1].timestamp;

  // 3600000 ms in an hour, compare to actual ms elapsed between timestamps
  let time_factor = 3600000 / (parseISO(t2) - parseISO(t1));

  let data = {
    // Power
    demand: {
      item: 'Demanda (kW)',
      old: Math.max(Math.max.apply(Math, perf.map((x) => x.power_cons)), proj.contracted_demand),
      new: Math.max.apply(Math, perf.map((x) => x.service_grid)),
    },
    // Power
    surcharge: {
      item: 'Ultrapassagem (kW)',
      old: Math.max(Math.max.apply(Math, perf.map((x) => x.power_cons)) - proj.contracted_demand, 0) ,
      new: Math.max.apply(Math, perf.map((x) => x.service_grid)) - proj.contracted_demand,
    },
    // Energy (fixed proportional energy in time block in case peak cutoff does not match time block)
    offpeaktusd: {
      item: 'TUSD Fora Ponta (kWh)',
      old: perf.reduce(function (acc, cur) { return acc + (cur.power_cons * (1 - cur.power_grid_peak)) / time_factor }, 0),
      new: perf.reduce(function (acc, cur) { return acc + (cur.power_cons * (1 - cur.power_grid_peak) > 0 ? cur.power_cons * (1 - cur.power_grid_peak) / cur.power_cons * cur.service_grid : 0) / time_factor }, 0),
    },
    // Energy (fixed proportional energy in time block in case peak cutoff does not match time block)
    peaktusd: {
      item: 'TUSD Ponta (kWh)',
      old: perf.reduce(function (acc, cur) { return acc + (cur.power_cons * cur.power_grid_peak / time_factor) }, 0) ,
      new: perf.reduce(function (acc, cur) { return acc + (cur.power_cons * cur.power_grid_peak > 0 ? cur.power_cons * cur.power_grid_peak / cur.power_cons * cur.service_grid : 0) / time_factor }, 0) ,
    }
  }

  // Power
  data.surcharge = {
    item: 'Ultrapassagem (kW)',
    old: data.demand.old - proj.contracted_demand,
    new: data.demand.new - proj.contracted_demand,
  }
  // Energy
  data.energy = {
    item: 'Energia Adicional (kWh)',
    old: data.peaktusd.old + data.offpeaktusd.old,
    new: data.peaktusd.new + data.offpeaktusd.new,
  }
  
  Object.keys(data).forEach((k) => {
    data[k].old_value = data[k].old * proj['bill_tar_' + k];
    data[k].new_value = data[k].new * proj['bill_tar_' + k];
    data[k].saving = data[k].new_value - data[k].old_value;
  })

  data.energy.new_value = data.energy.new_value - data.energy.old_value;
  data.energy.old_value = 0;

  data.subvention = {
    item: 'Subvenção (R$)',
    old_value: data.demand.old * proj.bill_subvention_demand + data.peaktusd.old * proj.bill_subvention_tusd,
    new_value: data.demand.new * proj.bill_subvention_demand + data.peaktusd.new * proj.bill_subvention_tusd,
  }
  data.subvention.saving = data.subvention.new_value - data.subvention.old_value;

  data.total = {
    item: 'Total',
    old_value: data.demand.old_value + data.surcharge.old_value + data.peaktusd.old_value + data.offpeaktusd.old_value + data.energy.old_value + data.subvention.old_value,
    new_value: data.demand.new_value + data.surcharge.new_value + data.peaktusd.new_value + data.offpeaktusd.new_value + data.energy.new_value + data.subvention.new_value,
    saving: data.demand.saving + data.surcharge.saving + data.peaktusd.saving + data.offpeaktusd.saving + data.energy.saving + data.subvention.saving,
    class: 'font-bold py-8 bg-slate-200'
  }

  return Object.values(data)
};