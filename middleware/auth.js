// import { useSystemStore } from "~~/store/cart";

// const systemStore = useSystemStore();


export default defineNuxtRouteMiddleware(() => {
   const user = useSupabaseUser();
   if (!user.value) {
        return navigateTo("/login");
   } else {
      // systemStore.updateUser(user.value);
   }
})
