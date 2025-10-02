import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useTheme } from "vuetify";

export const useThemeStore = defineStore("theme", () => {
  // Always set isDark to true by default
  const isDark = ref(true);

  const theme = useTheme();

  // Theme toggle function that now always sets theme to dark
  const toggleTheme = () => {
    isDark.value = true;
    theme.global.name.value = "dark";
  };

  // Theme setter function that ignores input and always sets theme to dark
  const setTheme = (dark: boolean) => {
    isDark.value = true;
    theme.global.name.value = "dark";
  };

  return {
    isDark: computed(() => isDark.value),
    toggleTheme,
    setTheme,
  };
});
