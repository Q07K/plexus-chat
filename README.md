# Plexus-Chat

Plexus-Chat is a next-generation LLM interface that structures user-AI conversations as an organic, interactive graph. It moves beyond the linear chat history, allowing for non-linear exploration, dynamic branching, and information synthesis.

**Concept**: "Connect, Merge, Disperse"

## Features

- **Organic Graph UI**: Powered by D3.js, visualizing conversations as nodes and links in an infinite force-directed canvas.
- **Dynamic Branching**: Click any node to "pivot" and start a new conversation branch from that context.
- **Synthesis Mode**: Toggle synthesis mode to merge insights from all active conversation branches (leaf nodes) into a comprehensive summary.
- **Modular Monolith Architecture**: Built with Vue 3, TypeScript, and Pinia, organized by business domains (Core, Conversation, Synthesis, UI).

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript** (Strict typing)
- **Vite** (Build tool)
- **D3.js** (Graph visualization and physics engine)
- **Pinia** (State management)
- **Vanilla CSS** (Variables-based theming)

## Project Structure

```
src/
  modules/
    core/           # Graph engine, store, main views
    conversation/   # Chat input, message logic
    synthesis/      # Synthesis mode logic and components
    ui/             # Shared UI components (Legend, buttons)
  shared/           # Utilities
  App.vue
  main.ts
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

- **Chat**: Type in the box to add a User node. An AI node will respond (simulated).
- **Branch**: Click on *any* previous node to select it (highlighted in gold ring). The next message you send will branch off from there.
- **Pan/Zoom**: Drag the canvas to pan, scroll to zoom.
- **Synthesis**: Click the "Synthesis Mode" toggle (top-right). All endpoint nodes (leaves) will be highlighted. Type a prompt to synthesize a conclusion based on all those endpoints.
