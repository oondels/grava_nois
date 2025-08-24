import { createVuetify } from "vuetify";
import "vuetify/styles";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

// Ícones necessários
import {
  mdiHome,
  mdiDownload,
  mdiHelp,
  mdiAccount,
  mdiMagnify,
  mdiMenu,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiShare,
  mdiCart,
  mdiCheck,
  mdiClose,
  mdiFilter,
  mdiCalendar,
  mdiSoccer,
  mdiBasketball,
  mdiVolleyball,
  mdiCreditCard,
  mdiCloudDownload,
  mdiRefresh,
  mdiAlert,
  mdiInformation,
  mdiThemeLightDark,
  mdiChevronDown,
} from "@mdi/js";

const customIcons = {
  ...aliases,
  home: mdiHome,
  download: mdiDownload,
  help: mdiHelp,
  account: mdiAccount,
  magnify: mdiMagnify,
  menu: mdiMenu,
  play: mdiPlay,
  pause: mdiPause,
  stop: mdiStop,
  share: mdiShare,
  cart: mdiCart,
  check: mdiCheck,
  close: mdiClose,
  filter: mdiFilter,
  calendar: mdiCalendar,
  soccer: mdiSoccer,
  basketball: mdiBasketball,
  volleyball: mdiVolleyball,
  creditCard: mdiCreditCard,
  cloudDownload: mdiCloudDownload,
  refresh: mdiRefresh,
  alert: mdiAlert,
  information: mdiInformation,
  themeLightDark: mdiThemeLightDark,
  chevronDown: mdiChevronDown,
};

const vuetify = createVuetify({
  theme: {
    defaultTheme: "dark",
    // Disable auto detection of system theme
    variations: { colors: [], lighten: 0, darken: 0 },
    themes: {
      dark: {
        colors: {
          primary: "#1B5E20",
          secondary: "#F57C00",
          accent: "#D32F2F",
          success: "#2E7D32",
          warning: "#F57F17",
          error: "#C62828",
          info: "#1976D2",
          surface: "#0F0F10",
          background: "#050506",
        },
      },
      light: {
        colors: {
          primary: "#1B5E20",
          secondary: "#F57C00",
          accent: "#D32F2F",
          success: "#2E7D32",
          warning: "#F57F17",
          error: "#C62828",
          info: "#1976D2",
          surface: "#FFFFFF",
          background: "#FAFAFA",
        },
      },
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases: customIcons,
    sets: { mdi },
  },
  defaults: {
    VBtn: {
      style: "text-transform: none;",
    },
    VCard: {
      elevation: 2,
    },
  },
});

export default vuetify;
