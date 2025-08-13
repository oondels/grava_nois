import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)
  
  const theme = useTheme()

  const toggleTheme = () => {
    isDark.value = !isDark.value
    theme.global.name.value = isDark.value ? 'dark' : 'light'
  }

  const setTheme = (dark: boolean) => {
    isDark.value = dark
    theme.global.name.value = dark ? 'dark' : 'light'
  }

  return {
    isDark: computed(() => isDark.value),
    toggleTheme,
    setTheme
  }
})