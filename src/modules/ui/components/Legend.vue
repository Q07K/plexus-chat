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
          <!-- Robot Icon -->
          <path d="M12 2a2 2 0 0 1 2 2v4h-4V4a2 2 0 0 1 2-2zm-7 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#fff" transform="translate(4, 4) scale(0.65)" />
        </svg>
      </div>
      <span class="label">{{ $t('legend.ai') }}</span>
    </div>

    <div class="legend-item">
      <div class="symbol-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
           <!-- Diamond -->
           <rect x="2" y="12" width="14" height="14" rx="2" transform="rotate(-45 2 12)" fill="var(--color-synthesis)" stroke="var(--color-node-stroke)" stroke-width="1.5" />
           <!-- Layers Icon -->
           <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" fill="#fff" transform="translate(4, 4) scale(0.65)" />
        </svg>
      </div>
      <span class="label">{{ $t('legend.synthesis') }}</span>
    </div>

    <div class="legend-item">
      <div class="symbol-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <!-- Octagon -->
           <path d="M12 2l7.07 2.93v7.65L12 22l-7.07-9.42V4.93L12 2z" fill="var(--color-system)" stroke="var(--color-node-stroke)" stroke-width="1.5" style="display:none;"/> 
           <!-- Proper Octagon Shape approximates -->
           <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" fill="var(--color-system)" stroke="var(--color-node-stroke)" stroke-width="1.5"/>
           <!-- Settings/Gear Icon (Consistent single path) -->
           <path d="M19.14 12.94c0.04-0.3 0.06-0.61 0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14 0.23-0.41 0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39 0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4 2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24 0-0.43 0.17-0.47 0.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-0.22-0.08-0.47 0-0.59 0.22L2.74 8.87 C2.62 9.08 2.66 9.34 2.86 9.48l2.03 1.58C4.84 11.36 4.8 11.69 4.8 12s0.02 0.64 0.07 0.94l-2.03 1.58 c-0.18 0.14-0.23 0.41-0.12 0.61l1.92 3.32c0.12 0.22 0.37 0.29 0.59 0.22l2.39-0.96c0.5 0.38 1.03 0.7 1.62 0.94l0.36 2.54 c0.05 0.24 0.24 0.41 0.48 0.41h3.84c0.24 0 0.44-0.17 0.47-0.41l0.36-2.54c0.59-0.24 1.13-0.56 1.62-0.94l2.39 0.96 c0.22 0.08 0.47 0 0.59-0.22l1.92-3.32c0.12-0.22 0.07-0.47-0.12-0.61L19.14 12.94z M12 15.6c-1.98 0-3.6-1.62-3.6-3.6 s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6S13.98 15.6 12 15.6z" fill="#fff" transform="translate(4,4) scale(0.65)"/>
        </svg>
      </div>
      <span class="label">{{ $t('legend.system') }}</span>
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
