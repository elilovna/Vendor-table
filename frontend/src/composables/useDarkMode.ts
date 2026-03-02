import { ref, watchEffect, type Ref } from 'vue'

interface DarkModeReturn {
  isDark: Ref<boolean>
  toggle: () => void
}

const isDark = ref(false)

function init(): void {
  const stored = localStorage.getItem('theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

init()

watchEffect(() => {
  document.documentElement.setAttribute(
    'data-theme',
    isDark.value ? 'dark' : 'light'
  )
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

export function useDarkMode(): DarkModeReturn {
  function toggle(): void {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
