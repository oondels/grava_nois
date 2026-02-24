import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "@/router";
import App from "@/App.vue";
import "./style.css";
// Removido @mdi/font: usaremos ícones SVG (mdi-svg)

// @ts-ignore
import "vuetify/styles";
import { createVuetify } from "vuetify";
import {
  VAlert,
  VApp,
  VAppBar,
  VAppBarNavIcon,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VChip,
  VChipGroup,
  VCol,
  VCombobox,
  VContainer,
  VDataTable,
  VDataTableServer,
  VDialog,
  VDivider,
  VExpansionPanel,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VExpansionPanels,
  VForm,
  VIcon,
  VImg,
  VList,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VMain,
  VMenu,
  VNavigationDrawer,
  VPagination,
  VProgressCircular,
  VProgressLinear,
  VRow,
  VSelect,
  VSheet,
  VSkeletonLoader,
  VSpacer,
  VSwitch,
  VTable,
  VTextField,
  VTextarea,
  VTooltip,
} from "vuetify/components";
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import { useAuthStore } from './store/auth'
import { setupInterceptors } from "@/services/api";

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
  components: {
    VAlert,
    VApp,
    VAppBar,
    VAppBarNavIcon,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCardTitle,
    VChip,
    VChipGroup,
    VCol,
    VCombobox,
    VContainer,
    VDataTable,
    VDataTableServer,
    VDialog,
    VDivider,
    VExpansionPanel,
    VExpansionPanelText,
    VExpansionPanelTitle,
    VExpansionPanels,
    VForm,
    VIcon,
    VImg,
    VList,
    VListItem,
    VListItemSubtitle,
    VListItemTitle,
    VMain,
    VMenu,
    VNavigationDrawer,
    VPagination,
    VProgressCircular,
    VProgressLinear,
    VRow,
    VSelect,
    VSheet,
    VSkeletonLoader,
    VSpacer,
    VSwitch,
    VTable,
    VTextField,
    VTextarea,
    VTooltip,
  },
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

const auth = useAuthStore(pinia)
setupInterceptors(auth, router)

  ; (async () => {
    await auth.ensureReady()
    app.mount('#app')
  })()
