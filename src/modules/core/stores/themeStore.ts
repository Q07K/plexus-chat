import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(true)

    // Initialize from localStorage or system preference
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            isDark.value = savedTheme === 'dark'
        } else {
            // Default to dark as per current design, or check system
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyTheme()
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        applyTheme()
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }

    const setDark = (val: boolean) => {
        isDark.value = val
        applyTheme()
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }

    const applyTheme = () => {
        // We apply class 'light-mode' to html or body if isDark is false
        // The default CSS is dark, so we toggle light-mode class
        const root = document.documentElement
        if (isDark.value) {
            root.classList.remove('light-mode')
            root.classList.add('dark-mode')
        } else {
            root.classList.add('light-mode')
            root.classList.remove('dark-mode')
        }
    }

    return {
        isDark,
        toggleTheme,
        setDark,
        initTheme
    }
})
