import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "@/router";
import App from "@/App.vue";
import "./style.css";
// Removido @mdi/font: usaremos ícones SVG (mdi-svg)

// @ts-ignore
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import { useAuthStore } from './store/auth'

// Notivue styles for notifications
import { createNotivue } from 'notivue'
import 'notivue/notifications.css'
// import 'notivue/animations.css' Removido para usar animacoes selecionadas
import 'notivue/notification-progress.css'

const notivue = createNotivue({
  position: 'top-right',
  limit: 5,
  enqueue: true,
  avoidDuplicates: true,
  notifications: {
    global: {
      duration: 3000
    }
  },
  animations: {
    enter: 'pop-in',
    leave: 'pop-out',
    clearAll: 'fade'
  }
})

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "dark",
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
});

const pinia = createPinia()

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(notivue)

const auth = useAuthStore()

  ; (async () => {
    await auth.ensureReady()
    app.mount('#app')
  })()
