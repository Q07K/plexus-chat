<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { useGraphStore, type GraphNode } from '@/modules/core/stores/graphStore'
import { useLLMStore } from '@/modules/core/stores/llmStore'
import ChatInput from './ChatInput.vue'
import SettingsModal from '@/modules/ui/components/SettingsModal.vue'
import ThemeToggle from '@/modules/ui/components/ThemeToggle.vue'

const store = useGraphStore()
const llmStore = useLLMStore()
const chatContainer = ref<HTMLElement | null>(null)
const isSettingsOpen = ref(false)

// Computed: Traverse keys back from activeNode to root to build "Current Thread"
const messages = computed(() => {
  if (!store.activeNodeId) return []

  // Traverse upwards
  const thread: GraphNode[] = []
  let currId: string | null = store.activeNodeId
  
  // To protect against infinite loops
  const visited = new Set<string>()

  while(currId && !visited.has(currId)) {
    visited.add(currId)
    const node = store.nodes.find(n => n.id === currId)
    if (!node) break
    thread.unshift(node) // Add to front
    
    // Find parent
    const link = store.links.find(l => {
       const tId = typeof l.target === 'object' ? (l.target as any).id : l.target
       return tId === currId
    })
    
    if (link) {
      currId = typeof link.source === 'object' ? (link.source as any).id : link.source as string
    } else {
      currId = null
    }
  }
  // Filter out Root if it is of type 'synthesis' with label "System" (or just checked by ID if fixed)
  // Actually, specs say "Change root node type to system... and remove from chat"
  // So we filter it here.
  return thread.filter(t => t.id !== 'root')
})

// Auto scroll to bottom
watch(messages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { deep: true })
</script>

<template>
  <div class="chat-panel">
    <div class="header">
      <div class="header-content">
        <h2>{{ $t('chat.thread') }}</h2>
        <div class="meta-info">
             <span class="badge">{{ messages.length }} {{ $t('chat.msgs') }}</span>
             <span class="model-badge" :class="llmStore.selectedModel?.provider">
               {{ llmStore.selectedModel?.name }}
             </span>
        </div>
      </div>
      <div class="header-actions">
        <ThemeToggle />
        <button class="settings-btn" @click="isSettingsOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="messages-list" ref="chatContainer">
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="message-item"
        :class="msg.type"
        @click="store.setActiveNode(msg.id)"
      >
        <div class="avatar">
          <span v-if="msg.type === 'user'">U</span>
          <span v-else-if="msg.type === 'ai'">AI</span>
          <span v-else>S</span>
        </div>
        <div class="bubble">
          {{ msg.label }}
        </div>
      </div>
      
      <div v-if="!store.activeNodeId" class="empty-state">
        {{ $t('chat.selectNode') }}
      </div>
    </div>
    
    <div class="input-area">
      <ChatInput />
    </div>
    
    <SettingsModal :isOpen="isSettingsOpen" @close="isSettingsOpen = false" />
  </div>
</template>

<style scoped>
.chat-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: var(--color-bg-panel-transparent);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.meta-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.settings-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-btn:hover {
  background: var(--color-bg-hover-glass);
  color: var(--color-text-primary);
}

.badge {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.model-badge {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-weight: 700;
    text-transform: uppercase;
}

.model-badge.openai {
    background: rgba(16, 163, 127, 0.2);
    color: #10a37f;
}

.model-badge.google {
    background: rgba(66, 133, 244, 0.2);
    color: #4285f4;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-item {
  display: flex;
  gap: 1rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.message-item:hover, .message-item.active { /* Using :class to match active logic if needed, but here filtered by active path */
  opacity: 1;
}

/* User Alignment? No, linear context usually left-aligned in standard LLM UI with different bubbles */
.message-item.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.message-item.user .avatar {
  background: var(--color-user);
  color: white;
}

.message-item.ai .avatar {
  background: var(--color-ai);
  color: white;
}

.message-item.synthesis .avatar {
  background: var(--color-synthesis);
  color: white;
}

.bubble {
  background: var(--color-bg-panel);
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text-primary);
  max-width: 80%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message-item.user .bubble {
  background: var(--color-bubble-user-bg);
  color: var(--color-bubble-user-text);
  border-top-right-radius: 2px;
}

.message-item.ai .bubble {
  background: var(--color-bubble-ai-bg);
  color: var(--color-bubble-ai-text);
  border-top-left-radius: 2px;
}

.message-item.synthesis .bubble {
  background: var(--color-bubble-synthesis-bg);
  color: var(--color-bubble-synthesis-text);
  border: 1px solid var(--color-synthesis);
}

.empty-state {
  text-align: center;
  color: var(--color-text-secondary);
  margin-top: 3rem;
  font-size: 0.9rem;
}
</style>
