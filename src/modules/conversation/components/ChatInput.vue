<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGraphStore, type GraphNode } from '@/modules/core/stores/graphStore'
import { useLLMStore } from '@/modules/core/stores/llmStore'

const { t } = useI18n()
const store = useGraphStore()
const llmStore = useLLMStore()
const input = ref('')
const isLoading = ref(false)

const generateId = () => Math.random().toString(36).substr(2, 9)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const autoResize = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

const handleSubmit = async () => {
  if (!input.value.trim() || isLoading.value) return
  
  // Basic safety check for keys
  if (!llmStore.openaiApiKey && !llmStore.googleApiKey) {
    alert(t('chat.error.apiKeyMissing'))
    // We could allow proceeding but it will likely fail or require mock.
    // Let's allow it to try, the store throws error which we catch.
  }

  const inputValue = input.value
  input.value = '' // Clear immediately
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
  isLoading.value = true

  try {
    if (store.isSynthesisMode) {
        // SYNTHESIS MODE
        // 1. Identify Leaves
        const sourceIds = new Set(store.links.map((l: any) => typeof l.source === 'object' ? l.source.id : l.source))
        const leafNodes = store.nodes.filter(n => !sourceIds.has(n.id))
        
        // 2. Create Synthesis Question Node
        const synthNodeId = generateId()
        const synthNode: GraphNode = {
          id: synthNodeId,
          type: 'synthesis',
          label: `[SYNTHESIS] ${inputValue}`
        }
        store.addNode(synthNode)

        // 3. Connect Leaves
        leafNodes.forEach(leaf => {
          store.addLink({ source: leaf.id, target: synthNodeId })
        })

        // 4. Create Answer Node (Thinking)
        const synthAnswerId = generateId()
        const synthAnswer: GraphNode = {
            id: synthAnswerId,
            type: 'synthesis',
            label: t('synthesis.status.synthesizing')
        }
        store.addNode(synthAnswer)
        store.addLink({ source: synthNodeId, target: synthAnswerId })
        store.setActiveNode(synthAnswerId)
        store.toggleSynthesisMode(false) 

        // 5. Call LLM
        // Context: All leaf node contents + User Query
        const contextText = leafNodes.map(n => `- ${n.label}`).join('\n')
        const prompt = `Here are several conversation threads contexts:\n${contextText}\n\nBased on these, please answer the following synthesis question:\n${inputValue}`
        
        const response = await llmStore.generateResponse(
            [{ role: 'user', content: prompt }],
            (chunk) => {
                const node = store.nodes.find(n => n.id === synthAnswerId)
                if (node) node.label = chunk
            }
        )
        
        // Final Update (ensure consistency)
        const finalNode = store.nodes.find(n => n.id === synthAnswerId)
        if (finalNode) finalNode.label = response

    } else {
        // NORMAL MODE
        // 1. Create User Node
        const userNodeId = generateId()
        const userNode: GraphNode = {
          id: userNodeId,
          type: 'user',
          label: inputValue
        }
        
        const lastNode = store.nodes[store.nodes.length - 1]
        const parentId = store.activeNodeId || (lastNode ? lastNode.id : null)

        store.addNode(userNode)
        if (parentId) {
          store.addLink({ source: parentId, target: userNode.id })
        }
        store.setActiveNode(userNodeId)

        // 2. Build Context
        // Get thread from userNode (inclusive) back to root
        // Note: GraphStore.getThread returns Root -> ... -> UserNode
        // We need to map this to {role, content}
        const thread = store.getThread(userNodeId)
        const messages = thread.map(n => ({
            role: n.type === 'user' ? 'user' : 'assistant', // Treat synthesis as assistant too?
            content: n.label
        }))

        // 3. Create AI Node (Thinking)
        const aiNodeId = generateId()
        const aiNode: GraphNode = {
            id: aiNodeId,
            type: 'ai',
            label: t('chat.thinking')
        }
        store.addNode(aiNode)
        store.addLink({ source: userNodeId, target: aiNodeId })
        store.setActiveNode(aiNodeId)

        // 4. Call LLM
        const response = await llmStore.generateResponse(
            messages,
            (chunk) => {
                const node = store.nodes.find(n => n.id === aiNodeId)
                if (node) node.label = chunk
            }
        )

        // 5. Update AI Node
        const finalCtxNode = store.nodes.find(n => n.id === aiNodeId)
        if (finalCtxNode) finalCtxNode.label = response
    }
  } catch (err: any) {
      console.error(err)
      // If error, maybe create an error node or update the thinking node?
      const activeId = store.activeNodeId
      if (activeId) {
          const node = store.nodes.find(n => n.id === activeId)
          if (node && (node.label === t('chat.thinking') || node.label === t('synthesis.status.synthesizing'))) {
              node.label = `Error: ${err.message}`
          }
      }
      alert(`${t('chat.error.generation')}${err.message}`)
  } finally {
      isLoading.value = false
  }
}
</script>

<template>
  <div class="chat-input-container">
    <div class="input-wrapper" :class="{ 'synthesis-active': store.isSynthesisMode }">
      <textarea
        v-model="input" 
        @keydown="handleKeydown"
        :placeholder="store.isSynthesisMode ? t('synthesis.placeholder') : t('chat.input.placeholder')" 
        class="chat-input"
        rows="1"
        ref="textareaRef"
        @input="autoResize"
      ></textarea>
      
      <div class="input-footer">
        <div class="left-actions">
            <button 
                @click="store.toggleSynthesisMode()" 
                class="synthesis-toggle-btn"
                :class="{ active: store.isSynthesisMode }"
                :title="t('synthesis.toggleTooltip')"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            </button>
        </div>
        <div class="right-actions">
             <button @click="handleSubmit" class="send-btn" :disabled="!input.trim() && !isLoading">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  width: 100%;
  padding: 0 1.5rem 1.5rem 1.5rem; /* Remove top padding */
  box-sizing: border-box;
  max-width: 900px;
  margin: 0 auto;
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column; /* Stack vertically */
  background: var(--color-bg-panel); /* Or a slightly lighter/input-specific bg */
  border: 1px solid var(--color-border);
  border-radius: 24px; /* More rounded like Gemini */
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all var(--transition-fast);
  width: 100%;
  box-sizing: border-box;
}

.input-wrapper:focus-within {
  box-shadow: 0 0 0 2px var(--color-user);
  background: var(--color-bg-primary); /* Slight highlight */
}

.input-wrapper.synthesis-active {
  border-color: var(--color-synthesis);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.1);
}

.input-wrapper.synthesis-active:focus-within {
  box-shadow: 0 0 0 2px var(--color-synthesis);
}

.chat-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 1rem;
  outline: none;
  min-height: 24px;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  padding: 0 0 0.5rem 0; /* Space below text */
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  box-sizing: border-box;
}

.chat-input::placeholder {
  color: var(--color-text-secondary);
}

/* Footer layout */
.input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.5rem;
}

.left-actions, .right-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Buttons */
.synthesis-toggle-btn {
  background: transparent; /* Unified with send-btn */
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  padding: 0;
}

.synthesis-toggle-btn:hover {
  background: var(--color-bg-hover-glass);
  color: var(--color-text-primary);
}

.synthesis-toggle-btn.active {
  color: var(--color-synthesis);
  background: rgba(245, 158, 11, 0.15);
  animation: pulse-synthesis 2s infinite;
}

@keyframes pulse-synthesis {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.send-btn {
  background: transparent;
  border: none;
  border-radius: 4px; /* Square/Icon style or Circle */
  /* Gemini uses a clear icon on the right. Let's keep existing circle but maybe cleaner */
  width: 36px; /* Match other buttons */
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
  color: var(--color-text-secondary); /* Default disabled-ish look */
}

/* Active send button state */
.send-btn:not(:disabled) {
    background: var(--color-user);
    color: white;
    border-radius: 50%; /* Circle when active */
}

.send-btn:disabled {
    cursor: default;
    /* Opacity removed to match Synthesis button color */
}

.send-btn:not(:disabled):hover {
  background: var(--color-user-hover);
}

/* Icon adjustments */
.icon {
  font-weight: bold;
  font-size: 1.2rem;
}
</style>
