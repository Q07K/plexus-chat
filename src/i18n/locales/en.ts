export default {
    legend: {
        user: 'User',
        ai: 'AI',
        synthesis: 'Synthesis',
        system: 'System',
        active: 'Active'
    },
    synthesis: {
        mode: 'Synthesis Mode',
        on: 'ON',
        off: 'OFF',
        toggleTooltip: 'Toggle Synthesis Mode',
        placeholder: 'Ask synthesis question...',
        status: {
            synthesizing: 'Synthesizing insights...'
        },
        context: 'Synthesis Context',
        intro: 'The following contexts are selected for synthesis:'
    },
    home: {
        title: 'Plexus Chat',
        subtitle: 'Connect. Merge. Disperse.'
    },
    chat: {
        thread: 'Context Thread',
        selectNode: 'Select a node to view the conversation thread.',
        msgs: 'msgs',
        input: {
            placeholder: 'Ask a question...',
            send: 'Send'
        },
        error: {
            apiKeyMissing: 'Please set your API Keys in Settings first!',
            generation: 'Error generating response: '
        },
        thinking: 'Thinking...',
        synthesizing: 'Synthesizing insights...',
        contextMenu: {
            copy: 'Copy',
            saveImage: 'Save as PNG'
        }
    },
    settings: {
        title: 'Settings',
        modelSelection: 'Model Selection',
        apiKeys: 'API Keys',
        openaiKey: 'OpenAI API Key',
        googleKey: 'Google Gemini API Key',
        hint: 'Keys are stored locally in your browser.',
        language: 'Language',
        tabs: {
            general: 'General',
            llm: 'LLM Config',
            data: 'Storage'
        },
        data: {
            title: 'Backup & Restore',
            export: 'Export Conversation',
            import: 'Import Conversation',
            desc: 'Save your current conversation graph to a file or load a previous one.',
            confirmLoad: 'This will replace your current conversation. Are you sure?',
            loadSuccess: 'Conversation loaded successfully!',
            filename: 'Filename',
            generateTitle: 'Generate Title (AI)'
        },
        llm: {
            systemPrompt: 'System Prompt',
            systemPromptPlaceholder: 'You are a helpful assistant...',
            parameters: 'Parameters',
            temperature: 'Temperature',
            topK: 'Top K'
        }
    }
}
