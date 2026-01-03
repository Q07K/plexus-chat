import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type LLMProvider = 'openai' | 'google'

export interface ModelOption {
    id: string
    name: string
    provider: LLMProvider
}

export const useLLMStore = defineStore('llm', () => {
    // Persist keys in localStorage for convenience (In prod, use secure storage or rely on env/proxy, but this is a client-side app pattern)
    const openaiApiKey = ref(localStorage.getItem('plexus_openai_key') || '')
    const googleApiKey = ref(localStorage.getItem('plexus_google_key') || '')

    const selectedModelId = ref(localStorage.getItem('plexus_selected_model') || 'gemini-pro')

    const availableModels: ModelOption[] = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' }
    ]

    const selectedModel = computed(() => availableModels.find(m => m.id === selectedModelId.value) || availableModels[0])

    const setOpenaiKey = (key: string) => {
        openaiApiKey.value = key
        localStorage.setItem('plexus_openai_key', key)
    }

    const setGoogleKey = (key: string) => {
        googleApiKey.value = key
        localStorage.setItem('plexus_google_key', key)
    }

    const setModel = (modelId: string) => {
        selectedModelId.value = modelId
        localStorage.setItem('plexus_selected_model', modelId)
    }

    const generateResponse = async (messages: { role: string, content: string }[]): Promise<string> => {
        const model = selectedModel.value
        if (!model) return 'Error: No model selected.'

        try {
            if (model.provider === 'openai') {
                if (!openaiApiKey.value) throw new Error('OpenAI API Key is missing')

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiApiKey.value}`
                    },
                    body: JSON.stringify({
                        model: model.id,
                        messages: messages.map(m => ({
                            role: m.role === 'user' ? 'user' : 'assistant', // Map 'ai'/'synthesis' to 'assistant'
                            content: m.content
                        }))
                    })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'OpenAI API Error')
                }

                const data = await response.json()
                return data.choices[0]?.message?.content || 'No response.'

            } else if (model.provider === 'google') {
                if (!googleApiKey.value) throw new Error('Google API Key is missing')

                // Gemini API format
                // https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY
                // Body: { contents: [{ parts: [{ text: "..." }] }] }
                // Supports history? Yes, "contents" is an array of turns.

                const contents = messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${googleApiKey.value}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'Google API Error')
                }

                const data = await response.json()
                // Safety check
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                return text || 'Blocked by safety settings or no response.'
            }
        } catch (error: any) {
            console.error(error)
            return `Error: ${error.message}`
        }

        return 'Provider not supported.'
    }

    return {
        openaiApiKey,
        googleApiKey,
        selectedModelId,
        availableModels,
        selectedModel,
        setOpenaiKey,
        setGoogleKey,
        setModel,
        generateResponse
    }
})
