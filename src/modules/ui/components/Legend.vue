<script setup lang="ts">
</script>

<template>
  <div class="legend-container">
    <div class="legend-item">
      <div class="symbol-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="var(--color-user)" stroke="var(--color-node-stroke)" stroke-width="1.5" />
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff" transform="translate(0, 0) scale(0.5) translate(12, 12)" />
        </svg>
      </div>
      <span class="label">{{ $t('legend.user') }}</span>
    </div>

    <div class="legend-item">
      <div class="symbol-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <!-- Flat topped hexagon approximation for legend -->
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" fill="var(--color-ai)" stroke="var(--color-node-stroke)" stroke-width="1.5"/>
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="#fff" transform="translate(4, 4) scale(0.65)" />
        </svg>
      </div>
      <span class="label">{{ $t('legend.ai') }}</span>
    </div>

    <div class="legend-item">
      <div class="symbol-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
           <!-- Diamond -->
           <rect x="2" y="12" width="14" height="14" rx="2" transform="rotate(-45 2 12)" fill="var(--color-synthesis)" stroke="var(--color-node-stroke)" stroke-width="1.5" />
           <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" fill="#fff" transform="translate(4, 4) scale(0.65)" />
        </svg>
      </div>
      <span class="label">{{ $t('legend.synthesis') }}</span>
    </div>

    <div class="legend-item">
      <div class="symbol-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--color-node-active)" stroke-width="2.5" fill="none" />
        </svg>
      </div>
      <span class="label">{{ $t('legend.active') }}</span>
    </div>
  </div>
</template>

<style scoped>
.legend-container {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: var(--color-bg-panel-transparent);
  backdrop-filter: blur(8px);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none;
  z-index: 20;
  box-shadow: var(--shadow-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.symbol-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  letter-spacing: 0.01em;
}
</style>
