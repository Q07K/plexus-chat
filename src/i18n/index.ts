import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ko from './locales/ko'

// Type-safety for messages
type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'ko'>({
    legacy: false, // Use Composition API
    locale: 'ko', // Default to Korean as per request or just one of them. User asked for multi-language, let's start with KO since they asked in KO.
    fallbackLocale: 'en',
    messages: {
        en,
        ko
    }
})

export default i18n
