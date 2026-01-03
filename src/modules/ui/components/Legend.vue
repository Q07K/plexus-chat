<script setup lang="ts">
</script>

<template>
  <div class="legend-container">
    <div class="legend-item">
      <div class="symbol user"></div>
      <span class="label">User</span>
    </div>
    <div class="legend-item">
      <div class="symbol ai"></div>
      <span class="label">AI</span>
    </div>
    <div class="legend-item">
      <div class="symbol synthesis"></div>
      <span class="label">Synthesis</span>
    </div>
    <div class="legend-item">
      <div class="symbol active"></div>
      <span class="label">Active / Selected</span>
    </div>
  </div>
</template>

<style scoped>
.legend-container {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none; /* Pass clicks through? Maybe not strictly needed if small */
  z-index: 20;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.symbol {
  width: 16px;
  height: 16px;
  border: 1.5px solid #fff;
}

.symbol.user {
  background: var(--color-user);
  border-radius: 6px;
}

.symbol.ai {
  background: var(--color-ai);
  border-radius: 50%;
}

.symbol.synthesis {
  background: var(--color-synthesis);
  border-radius: 50%;
  border-width: 2px;
}

.symbol.active {
  background: transparent;
  border-color: #fcd34d;
  border-width: 2px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(252, 211, 77, 0.3);
}

.label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}
</style>
