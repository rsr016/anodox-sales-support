import colors from "#tailwind-config/theme/colors";
import { parseISO  } from "date-fns";

export const findPeaks = (data) => {
  let peaks = data.map((d) => d.peak == 0 ? 0 : (d.service_grid > 0 ? 1 : -1));

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
  console.log('update calcs')
  let t1 = data.powerprofile[0].timestamp;
  let t2 = data.powerprofile[1].timestamp;

  // 3600000 ms in an hour, compare to actual ms elapsed between timestamps
  let time_factor = 3600000 / (parseISO(t2) - parseISO(t1));
  let sendout_limit = data.output_rating;

  data.powerprofile.forEach((item, index, arr) => {
    var item = arr[index];
    item.contracted = data.contracted_demand;
    item.bess_capacity = data.energy_capacity;
    item.eff_charge = (100 - data.charge_losses) / 100;
    item.eff_discharge = (100 - data.discharge_losses) / 100;
    item.bess_min = (data.min_soc * item.bess_capacity) / 100;
    item.bess_max = (data.max_soc * item.bess_capacity) / 100;

    if (index == 0) {
      item.bess_energy = 0;
      item.bess_cycles = 0;
    } else {
      item.bess_energy = arr[index - 1].bess_energy;
      item.bess_cycles = arr[index - 1].bess_cycles;
    }

    if (item.peak > 0) {
      item.power_available = 0;
      item.power_requested = item.peak;
    } else {
      item.power_available = Math.max(item.contracted - item.aggregate, 0);
      item.power_requested = Math.max(item.aggregate - item.contracted, 0);
    }

    if (item.power_available > 0) {
      item.bess_gross_charge = Math.min(
        item.power_available / time_factor,
        (item.bess_max - item.bess_energy) / item.eff_charge,
        sendout_limit / time_factor
      );
      item.bess_net_charge = item.bess_gross_charge * item.eff_charge;
      item.bess_gross_discharge = 0;
      item.bess_net_discharge = 0;

      item.bess_energy += item.bess_net_charge;
    } else if (item.power_requested > 0) {
      item.bess_gross_charge = 0;
      item.bess_net_charge = 0;
      item.bess_gross_discharge = Math.min(
        item.bess_energy - item.bess_min,
        item.power_requested / time_factor / item.eff_discharge,
        sendout_limit / time_factor
      );
      item.bess_net_discharge = item.bess_gross_discharge * item.eff_discharge;

      item.bess_energy -= item.bess_gross_discharge;
    }

    item.bess_soc = item.bess_energy / item.bess_capacity;
    item.bess_cycles += item.bess_net_discharge / item.bess_capacity;

    item.service_grid = item.aggregate - item.bess_net_discharge * time_factor;
    item.service_to_bess = item.bess_gross_charge * time_factor;
    item.service_from_bess = item.bess_net_discharge * time_factor;

    arr[index] = item;
  });

  return data;
};