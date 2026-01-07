<script setup lang="ts">
import { useLLMStore } from '@/modules/core/stores/llmStore'
import { useGraphStore } from '@/modules/core/stores/graphStore'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

// Local state for inputs to allow cancellation? 
// Actually, let's bind directly for simplicity or copy on open.
// Binding directly is fine for this prototype.

const activeTab = ref('general') // 'general' | 'llm'

const { t, locale } = useI18n()
const store = useLLMStore()
const graphStore = useGraphStore()
const fileInput = ref<HTMLInputElement | null>(null)

const exportData = () => {
  const data = {
    version: 1,
    timestamp: new Date().toISOString(),
    graph: {
      nodes: graphStore.nodes.map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
        summary: n.summary,
        x: n.x,
        y: n.y
      })),
      links: graphStore.links.map((l: any) => ({
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target
      }))
    },
    llmSettings: {
        systemPrompt: store.systemPrompt,
        temperature: store.temperature,
        topK: store.topK,
        modelId: store.selectedModelId
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `plexus_chat_backup_${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const triggerImport = () => {
  fileInput.value?.click()
}

const importData = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)
      
      if (confirm(t('settings.data.confirmLoad'))) {
          // Check for valid structure
          if (data.graph && Array.isArray(data.graph.nodes) && Array.isArray(data.graph.links)) {
             // Sanitize links to ensure they use IDs, handling both legacy (object) and fresh (id) formats
             const cleanLinks = data.graph.links.map((l: any) => ({
                 source: typeof l.source === 'object' ? l.source.id : l.source,
                 target: typeof l.target === 'object' ? l.target.id : l.target
             }))
             
             graphStore.loadGraph(data.graph.nodes, cleanLinks)
             
             // Restore LLM Settings if present
             if (data.llmSettings) {
                store.setSystemPrompt(data.llmSettings.systemPrompt || '')
                store.setTemperature(data.llmSettings.temperature || 0.7)
                store.setTopK(data.llmSettings.topK || 40)
                if (data.llmSettings.modelId) {
                    store.setModel(data.llmSettings.modelId)
                }
             }

             alert(t('settings.data.loadSuccess'))
             emit('close')
          } else {
             alert('Invalid file format: missing graph nodes or links.')
          }
      }
    } catch (err) {
      console.error(err)
      alert('Failed to parse JSON file.')
    } finally {
        target.value = ''
    }
  }
  reader.readAsText(file)
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t('settings.title') }}</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <div class="tabs">
            <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'general' }"
                @click="activeTab = 'general'"
            >
                {{ t('settings.tabs.general') }}
             </button>
             <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'llm' }"
                @click="activeTab = 'llm'"
            >
                {{ t('settings.tabs.llm') }}
             </button>
             <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'data' }"
                @click="activeTab = 'data'"
            >
                {{ t('settings.tabs.data') }}
            </button>
        </div>
        
        <div v-if="activeTab === 'general'" class="tab-content">
            <div class="section">
            <h4>{{ t('settings.language') }}</h4>
          <div class="model-options">
            <label class="model-option" :class="{ active: locale === 'en' }">
              <input type="radio" value="en" v-model="locale">
              <span class="model-name">English</span>
            </label>
            <label class="model-option" :class="{ active: locale === 'ko' }">
              <input type="radio" value="ko" v-model="locale">
              <span class="model-name">한국어</span>
            </label>
          </div>
        </div>

        <div class="section">
          <h4>{{ t('settings.modelSelection') }}</h4>
          <div class="model-options">
            <label 
              v-for="model in store.availableModels" 
              :key="model.id"
              class="model-option"
              :class="{ active: store.selectedModelId === model.id }"
            >
              <input 
                type="radio" 
                name="model" 
                :value="model.id" 
                :checked="store.selectedModelId === model.id"
                @change="store.setModel(model.id)"
              />
              <span class="model-name">{{ model.name }}</span>
              <span class="provider-badge" :class="model.provider">{{ model.provider }}</span>
            </label>
          </div>
        </div>

        <div class="section">
          <h4>{{ t('settings.apiKeys') }}</h4>
          <div class="input-group">
            <label>{{ t('settings.openaiKey') }}</label>
            <input 
              type="password" 
              :value="store.openaiApiKey" 
              @input="(e) => store.setOpenaiKey((e.target as HTMLInputElement).value)"
              placeholder="sk-..."
            />
          </div>
          <div class="input-group">
            <label>{{ t('settings.googleKey') }}</label>
            <input 
              type="password" 
              :value="store.googleApiKey" 
              @input="(e) => store.setGoogleKey((e.target as HTMLInputElement).value)"
              placeholder="AIza..."
            />
          </div>
          <p class="hint">{{ t('settings.hint') }}</p>
        </div>
        </div>

        <div v-if="activeTab === 'llm'" class="tab-content">
            <div class="section">
                <h4>{{ t('settings.llm.systemPrompt') }}</h4>
                <div class="input-group">
                    <textarea 
                        class="system-prompt-input"
                        :value="store.systemPrompt" 
                        @input="(e) => store.setSystemPrompt((e.target as HTMLTextAreaElement).value)"
                        :placeholder="t('settings.llm.systemPromptPlaceholder')"
                    ></textarea>
                </div>
            </div>

            <div class="section">
                <h4>{{ t('settings.llm.parameters') }}</h4>
                <div class="input-group">
                    <label>{{ t('settings.llm.temperature') }}: {{ store.temperature }}</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1"
                        :value="store.temperature"
                        @input="(e) => store.setTemperature(Number((e.target as HTMLInputElement).value))"
                    />
                </div>
                 <div class="input-group">
                    <label>{{ t('settings.llm.topK') }}: {{ store.topK }}</label>
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        step="1"
                        :value="store.topK"
                        @input="(e) => store.setTopK(Number((e.target as HTMLInputElement).value))"
                    />
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'data'" class="tab-content">
            <div class="section">
                <h4>{{ t('settings.data.title') }}</h4>
                <p class="description">{{ t('settings.data.desc') }}</p>
                <div class="action-buttons">
                    <button class="action-btn" @click="exportData">
                        {{ t('settings.data.export') }}
                    </button>
                    <button class="action-btn" @click="triggerImport">
                        {{ t('settings.data.import') }}
                    </button>
                    <input 
                        type="file" 
                        ref="fileInput" 
                        accept=".json" 
                        style="display: none" 
                        @change="importData"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.section {
  margin-bottom: 2rem;
}

.section h4 {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.input-group input {
  width: 100%;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--color-text-primary);
  font-family: monospace;
  box-sizing: border-box; /* Fix width */
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-user);
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.model-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.model-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.model-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.model-option.active {
  border-color: var(--color-user);
  background: rgba(99, 102, 241, 0.1);
}

.model-option input {
  margin-right: 1rem;
}

.model-name {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
}

.provider-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 700;
}

.provider-badge.openai {
  background: #10a37f;
  color: white;
}

.provider-badge.google {
  background: #4285f4;
  color: white;
}

/* Tabs */
.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
}

.tab-btn {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 500;
    position: relative;
}

.tab-btn.active {
    color: var(--color-text-primary);
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--color-user);
}

.system-prompt-input {
    width: 100%;
    height: 120px;
    background: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--color-text-primary);
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box; 
    line-height: 1.5;
}

.system-prompt-input:focus {
    outline: none;
    border-color: var(--color-user);
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  background: var(--color-bg-hover-glass);
  border-color: var(--color-user);
}
</style>
