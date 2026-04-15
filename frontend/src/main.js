import "@/assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import { useCrmStore } from "@/stores/crm";
import { useFinanceStore } from "@/stores/finance";
import { useProjectStore } from "@/stores/projects";

const app = createApp(App);

app.use(createPinia());

useFinanceStore().load();
useProjectStore().load();
useCrmStore().load();

app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".p-dark",
      cssLayer: false,
    },
  },
});
app.use(router);

app.mount("#app");
