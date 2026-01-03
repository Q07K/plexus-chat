<script setup lang="ts">
import GraphCanvas from '../components/GraphCanvas.vue'
import ChatPanel from '@/modules/conversation/components/ChatPanel.vue'
import Legend from '@/modules/ui/components/Legend.vue'
</script>

<template>
  <div class="home-view">
    <div class="graph-area">
      <GraphCanvas />
      <Legend />
    </div>
    <ChatPanel />
    <div class="placeholder-content">
      <h1 class="title">{{ $t('home.title') }}</h1>
      <p class="subtitle">{{ $t('home.subtitle') }}</p>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at center, var(--color-bg-gradient-start) 0%, var(--color-bg-gradient-end) 100%);
  display: flex; /* Sidebar layout */
}

.graph-area {
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.placeholder-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none; /* Let clicks pass through to canvas later */
  z-index: 0;
  opacity: 0.5; /* Optional: fade it out a bit so it looks like a watermark */
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.05em;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  font-weight: 300;
}
</style>
