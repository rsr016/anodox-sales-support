import { defineStore } from "pinia";

export const useSystemStore = defineStore("system", {
  state: () => {
    return {
      user: null,
      clients: null,
      projects: null,
      data: null,
      loading: true,
    };
  },

  actions: {
    updateUser(x) {
      this.user = x;
    },
    updateClients(x) {
      this.clients = x;
    },
    updateProjects(x) {
      this.projects = x;
    },
    updateData(x) {
      this.data = x;
    },
    setLoading() {
      this.loading = true;
    },
    setLoaded() {
      this.loading = false;
    },
  },
});
