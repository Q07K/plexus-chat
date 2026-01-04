import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type LLMProvider = 'openai' | 'google'

export interface ModelOption {
    id: string
    name: string
    provider: LLMProvider
}

export const useLLMStore = defineStore('llm', () => {
    // Persist keys in localStorage
    const openaiApiKey = ref(localStorage.getItem('plexus_openai_key') || '')
    const googleApiKey = ref(localStorage.getItem('plexus_google_key') || '')

    const selectedModelId = ref(localStorage.getItem('plexus_selected_model') || 'gemini-pro')
    const systemPrompt = ref(localStorage.getItem('plexus_system_prompt') || '')
    const temperature = ref(Number(localStorage.getItem('plexus_temperature') || 0.7))
    const topK = ref(Number(localStorage.getItem('plexus_top_k') || 40))

    const availableModels: ModelOption[] = [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        { id: 'gemini-3.0-flash-preview', name: 'Gemini 3.0 Flash Preview', provider: 'google' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
        { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', provider: 'google' },
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

    const setSystemPrompt = (prompt: string) => {
        systemPrompt.value = prompt
        localStorage.setItem('plexus_system_prompt', prompt)
    }

    const setTemperature = (temp: number) => {
        temperature.value = temp
        localStorage.setItem('plexus_temperature', String(temp))
    }

    const setTopK = (k: number) => {
        topK.value = k
        localStorage.setItem('plexus_top_k', String(k))
    }

    /**
     * Generates a response using Streaming.
     * Replaces the old generateResponse logic.
     */
    const generateResponse = async (
        messages: { role: string, content: string }[],
        onChunk?: (text: string) => void // Optional callback for streaming updates
    ): Promise<string> => {
        const model = selectedModel.value
        if (!model) return 'Error: No model selected.'

        let fullText = ''

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
                        messages: [
                            ...(systemPrompt.value ? [{ role: 'system', content: systemPrompt.value }] : []),
                            ...messages.map(m => ({
                                role: m.role === 'user' ? 'user' : 'assistant',
                                content: m.content
                            }))
                        ],
                        temperature: temperature.value,
                        stream: true // Enable Streaming
                    })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'OpenAI API Error')
                }

                if (!response.body) throw new Error('ReadableStream not supported')

                const reader = response.body.getReader()
                const decoder = new TextDecoder()

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            if (data === '[DONE]') break

                            try {
                                const parsed = JSON.parse(data)
                                const content = parsed.choices[0]?.delta?.content
                                if (content) {
                                    fullText += content
                                    onChunk?.(fullText)
                                }
                            } catch (e) {
                                // Ignore json parse errors for partial chunks
                            }
                        }
                    }
                }

            } else if (model.provider === 'google') {
                if (!googleApiKey.value) throw new Error('Google API Key is missing')

                const contents = [
                    ...(systemPrompt.value ? [{
                        role: 'user',
                        parts: [{ text: `System Prompt: ${systemPrompt.value}` }] // Gemini 1.5 doesn't have system role in chat history easily via REST v1beta sometimes, but let's try standard way or prepend.
                        // Actually, 'system' role is supported in new models.
                        // But for broad compatibility in v1beta REST, prepending is safer or using 'model' with 'system instruction'.
                        // Let's just prepend to first message or separate turn?
                        // Simple approach: Prepend to context.
                    }] : []),
                    ...messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                ]

                // NOTE: For Gemini, System Instructions are passed separately in valid config usually, 
                // but here sticking to simple chat turns.
                // If prepended as a 'user' turn saying "System Prompt: ...", it works reasonably well.

                // Use streamGenerateContent
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.id}:streamGenerateContent?key=${googleApiKey.value}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: temperature.value,
                            topK: topK.value
                        }
                    })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error?.message || 'Google API Error')
                }

                if (!response.body) throw new Error('ReadableStream not supported')

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''
                let scannerIndex = 0

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    buffer += chunk

                    const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g
                    regex.lastIndex = scannerIndex // Start searching from where we left off

                    let match
                    while ((match = regex.exec(buffer)) !== null) {
                        try {
                            const textContent = JSON.parse(`"${match[1]}"`)
                            fullText += textContent
                            onChunk?.(fullText)
                            scannerIndex = regex.lastIndex // Update usage
                        } catch (e) {
                            // Ignore partial/invalid escapes
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error(error)
            return fullText || `Error: ${error.message}`
        }

        return fullText || 'No response.'
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
        generateResponse,
        systemPrompt,
        temperature,
        topK,
        setSystemPrompt,
        setTemperature,
        setTopK
    }
})
