<script setup lang="ts">
import { useLLMStore } from '@/modules/core/stores/llmStore'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const store = useLLMStore()

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
  background: rgba(15, 23, 42, 0.5); /* Darker slot */
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
</style>
