<script setup lang="ts">
import { useGraphStore } from '@/modules/core/stores/graphStore'

const store = useGraphStore()
</script>

<template>
  <button 
    class="synthesis-toggle"
    :class="{ active: store.isSynthesisMode }"
    @click="store.toggleSynthesisMode()"
  >
    <div class="toggle-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <span class="label">{{ $t('synthesis.mode') }}</span>
    <span class="status">{{ store.isSynthesisMode ? $t('synthesis.on') : $t('synthesis.off') }}</span>
  </button>
</template>

<style scoped>
.synthesis-toggle {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-bg-panel-transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 20;
}

.synthesis-toggle:hover {
  background: var(--color-bg-panel);
  border-color: var(--color-text-secondary);
}

.synthesis-toggle.active {
  background: var(--color-synthesis-glow);
  border-color: var(--color-synthesis);
  color: #fff;
}

.toggle-icon {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  font-size: 0.9rem;
}

.status {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.8;
  padding: 0.1rem 0.4rem;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
}
</style>
