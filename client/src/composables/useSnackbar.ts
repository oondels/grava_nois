import { ref } from 'vue'

interface SnackbarOptions {
  text: string
  color: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

const snackbar = ref<SnackbarOptions & { show: boolean }>({
  show: false,
  text: '',
  color: 'info',
  timeout: 4000
})

export const useSnackbar = () => {
  const showSnackbar = (
    text: string, 
    color: 'success' | 'error' | 'warning' | 'info' = 'info',
    timeout: number = 4000
  ) => {
    snackbar.value = {
      show: true,
      text,
      color,
      timeout
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  return {
    snackbar,
    showSnackbar,
    hideSnackbar
  }
}