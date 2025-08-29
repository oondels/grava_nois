import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "@/router";
import App from "@/App.vue";
import "./style.css";
import "@mdi/font/css/materialdesignicons.min.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { useAuthStore } from './store/auth'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
  },
});

const app = createApp(App);


app.use(createPinia());
app.use(router);
app.use(vuetify);

const auth = useAuthStore()
await auth.init()

app.mount("#app");
