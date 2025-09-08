import { push } from 'notivue'

type Color = 'success' | 'error' | 'warning' | 'info'

export const useSnackbar = () => {
  const showSnackbar = (
    text: string,
    color: Color = 'info',
    timeout = 4000
  ) => {
    // Normalize type mapping
    const type: Color =
      color === 'warning' ? 'warning' : color === 'error' ? 'error' : color === 'success' ? 'success' : 'info'

    // Prefer typed helpers if available, otherwise generic push
    // @ts-expect-error - runtime helpers may exist depending on notivue version
    if (push[type]) {
      // @ts-expect-error - dynamic helper call
      push[type](text, { duration: timeout })
    } else {
      push(text, { type, duration: timeout })
    }
  }

  const hideSnackbar = () => {
    push.clearAll()
  }

  return {
    showSnackbar,
    hideSnackbar
  }
}
