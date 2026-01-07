<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: false, // disable HTML for security
  linkify: true,
  typographer: true
})

const renderedMarkdown = computed(() => {
  return md.render(props.content || '')
})
</script>

<template>
  <div class="markdown-content" v-html="renderedMarkdown"></div>
</template>

<style>
/* Scoped doesn't work well with v-html content unless using ::v-deep or regular style */
.markdown-content {
  line-height: 1.6;
  font-size: 0.95rem;
}

.markdown-content p {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content h1, 
.markdown-content h2, 
.markdown-content h3, 
.markdown-content h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.markdown-content h1 { font-size: 1.5rem; }
.markdown-content h2 { font-size: 1.25rem; }
.markdown-content h3 { font-size: 1.1rem; }

.markdown-content ul, 
.markdown-content ol {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content code {
  background: rgba(127, 127, 127, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: var(--font-family-code);
  font-size: 0.9em;
}

.markdown-content pre {
  background: rgba(0, 0, 0, 0.2); /* Darker background for code blocks */
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content blockquote {
  border-left: 3px solid var(--color-primary);
  margin-left: 0;
  padding-left: 1rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.markdown-content a {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
