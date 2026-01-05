<script setup lang="ts">
import { onMounted, ref, onUnmounted, watchEffect } from 'vue'
import * as d3 from 'd3'
import { useResizeObserver } from '@vueuse/core'
import { useGraphStore } from '../stores/graphStore'
import MarkdownRenderer from '@/modules/ui/components/MarkdownRenderer.vue'

/**
 * GraphCanvas.vue
 * Core component for rendering the D3 force-directed graph.
 * Handles:
 * - D3 Initialization
 * - Force Simulation
 * - Zoom/Pan behavior
 */

const containerRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)

// Tooltip State
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  content: ''
})

const store = useGraphStore()

// D3 Selections
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
let g: d3.Selection<SVGGElement, unknown, null, undefined>
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>
let simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>

  // Helper to re-calculate depths and update simulation forces
  const updateSimulation = () => {
      const depthMap = new Map<string, number>()
      const sLinks = store.links
      const children = new Map<string, string[]>()
      
      // Build adjacency
      sLinks.forEach((l: any) => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        if(!children.has(s)) children.set(s, [])
        children.get(s)!.push(t)
      })
      
      // BFS for depths
      const queue: {id: string, d: number}[] = []
      
      // Find roots (nodes with no incoming links)
      // Actually, standard conversation tree starts at the first node added.
      // Let's assume store.nodes[0] is root, or find nodes with no sources.
      const targetIds = new Set(sLinks.map((l: any) => typeof l.target === 'object' ? l.target.id : l.target))
      const roots = store.nodes.filter(n => !targetIds.has(n.id))
      
      roots.forEach(r => {
        queue.push({id: r.id, d: 0})
        depthMap.set(r.id, 0)
      })
      
      // Fallback if no roots found (cycles?), start from first node
      const firstNode = store.nodes[0]
      if (roots.length === 0 && firstNode) {
          queue.push({id: firstNode.id, d: 0})
          depthMap.set(firstNode.id, 0)
      }

      while(queue.length > 0) {
        const {id, d} = queue.shift()!
        const kids = children.get(id) || []
        kids.forEach(kid => {
          if(!depthMap.has(kid)) {
            depthMap.set(kid, d + 1)
            queue.push({id: kid, d: d + 1})
          }
        })
      }
      
      // Force Update
      simulation.force('y', d3.forceY((d: any) => {
         const depth = depthMap.get(d.id) ?? (d.type === 'synthesis' ? 5 : 0)
         return depth * 120 + 100
      }).strength(1))
      
      simulation.nodes(store.nodes as d3.SimulationNodeDatum[])
      simulation.force<d3.ForceLink<any, any>>('link')?.links(store.links)
      simulation.alpha(1).restart()
  }

  const initGraph = () => {
  if (!svgRef.value || !containerRef.value) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  d3.select(svgRef.value).selectAll('*').remove()

  svg = d3.select(svgRef.value)
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height])

  g = svg.append('g').attr('class', 'graph-content')

  zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

  svg.call(zoom).on('dblclick.zoom', null)

  simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collide', d3.forceCollide(30))
      .force('x', d3.forceX(width / 2).strength(0.1))
      
  // Initial render
  updateSimulation()
  render()
}


  const hexPath = (r: number) => {
    // Flat-topped hexagon
    const a = (2 * Math.PI) / 6;
    return "M" + [0, 1, 2, 3, 4, 5].map(i => [r * Math.cos(a * i), r * Math.sin(a * i)]).join("L") + "Z";
  };

  const render = () => {
  // Render Links
  let linkGroup = g.select<SVGGElement>('.links')
  if (linkGroup.empty()) {
    linkGroup = g.append('g').attr('class', 'links')
  }

  const link = linkGroup.selectAll('path')
      .data(store.links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-link-inactive)')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)

  // Render Nodes
  let nodeGroup = g.select<SVGGElement>('.nodes')
  if (nodeGroup.empty()) {
    nodeGroup = g.append('g').attr('class', 'nodes')
  }

  const node = nodeGroup.selectAll<SVGGElement, d3.SimulationNodeDatum>('.node-group')
      .data(store.nodes, (d: any) => d.id)
      .join(
        enter => {
          const group = enter.append('g').attr('class', 'node-group')

          // --- User Node (Circle + Person Icon) ---
          const userGroup = group.filter((d: any) => d.type === 'user');
          userGroup.append('circle')
               .attr('r', 22)
               .attr('fill', 'var(--color-user)')
               .attr('stroke', 'var(--color-node-stroke)')
               .attr('stroke-width', 2)
               .attr('class', 'node-shape');
          
          userGroup.append('path')
               .attr('d', "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z") // Simple Material User Icon
               .attr('transform', 'translate(-12, -12) scale(1)') // Center 24x24 icon
               .attr('fill', '#ffffff')
               .attr('opacity', 0.9);


          // --- AI Node (Hexagon + Sparkle Icon) ---
          const aiGroup = group.filter((d: any) => d.type === 'ai');
          aiGroup.append('path')
               .attr('d', hexPath(24))
               .attr('fill', 'var(--color-ai)')
               .attr('stroke', 'var(--color-node-stroke)')
               .attr('stroke-width', 2)
               .attr('class', 'node-shape');

          aiGroup.append('path')
               .attr('d', "M12 2a2 2 0 0 1 2 2v4h-4V4a2 2 0 0 1 2-2zm-7 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z") // Robot Icon
               .attr('transform', 'translate(-12, -12) scale(1)') // Center
               .attr('fill', '#ffffff')
               .attr('opacity', 0.9);


          // --- Synthesis Node (Diamond + Layers Icon) ---
          const synthGroup = group.filter((d: any) => d.type === 'synthesis');
          
          // Diamond shape (rotated square)
          synthGroup.append('rect')
               .attr('width', 36)
               .attr('height', 36)
               .attr('x', -18)
               .attr('y', -18)
               .attr('rx', 4)
               .attr('transform', 'rotate(45)')
               .attr('fill', 'var(--color-synthesis)')
               .attr('stroke', 'var(--color-node-stroke)')
               .attr('stroke-width', 3)
               .attr('class', 'node-shape');

          // Layers icon path
          synthGroup.append('path')
               .attr('d', "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z")
               .attr('transform', 'translate(-12, -12) scale(1)')
               .attr('fill', '#ffffff')
               .attr('opacity', 0.9);


          // --- System Node (Octagon + CPU/Settings Icon) ---
          const systemGroup = group.filter((d: any) => d.type === 'system');
          
          // Octagon
          const octagonPath = (r: number) => {
              const n = 8;
              const a = (2 * Math.PI) / n;
              // Rotate by pi/8 to make it look like a stop sign / block
              const offset = Math.PI / 8;
              return "M" + Array.from({length: n}).map((_, i) => [r * Math.cos(a * i + offset), r * Math.sin(a * i + offset)]).join("L") + "Z";
          };

          systemGroup.append('path')
               .attr('d', octagonPath(26))
               .attr('fill', 'var(--color-system)')
               .attr('stroke', 'var(--color-node-stroke)')
               .attr('stroke-width', 2)
               .attr('class', 'node-shape');

          // Settings / CPU Icon
          systemGroup.append('path')
               .attr('d', "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z")
               .attr('transform', 'translate(-12, -12) scale(1)')
               .attr('fill', '#ffffff')
               .attr('opacity', 0.9);

          return group
        },
        update => update,
        exit => exit.remove()
      )
      .call(drag(simulation))
      .on('click', (event, d: any) => {
        store.setActiveNode(d.id)
        event.stopPropagation() // Prevent zoom click
      })
      .on('mouseenter', (event, d: any) => {
          if (d.summary) {
              tooltip.value = {
                  visible: true,
                  x: event.clientX + 15,
                  y: event.clientY + 15,
                  content: d.summary
              }
          }
      })
      .on('mousemove', (event) => {
          if (tooltip.value.visible) {
             tooltip.value.x = event.clientX + 15
             tooltip.value.y = event.clientY + 15
          }
      })
      .on('mouseleave', () => {
          tooltip.value.visible = false
      })

  // Re-Apply simulation for new nodes
  simulation.nodes(store.nodes as d3.SimulationNodeDatum[])
  simulation.force<d3.ForceLink<any, any>>('link')?.links(store.links)
  simulation.alpha(1).restart()
  
  simulation.on('tick', () => {
    link.attr('d', (d: any) => {
        const sx = d.source.x
        const sy = d.source.y
        const tx = d.target.x
        const ty = d.target.y
        const midY = (sy + ty) / 2
        return `M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`
    })

    node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
}

// Drag Behavior
const drag = (simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) => {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: any) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as any
}

// Handle Resize
useResizeObserver(containerRef, (entries) => {
  const entry = entries[0]
  if (!entry) return
  const { width, height } = entry.contentRect
  if(svg && simulation) {
    svg.attr('width', width).attr('height', height)
    // Only update horizontal center force
    simulation.force('x', d3.forceX(width / 2).strength(0.1))
    simulation.alpha(1).restart()
  }
})

onMounted(() => {
  initGraph()
  
  // 1. Data Watcher: Update Simulation & Structure
  watchEffect(() => {
    if (simulation && (store.nodes.length || store.links.length)) {
       render()
       updateSimulation()
    }
  })

  // 2. Highlighting Watcher: Update Styles (Colors, Opacity)
  watchEffect(() => {
     // Access store dependencies
     const activeId = store.activeNodeId
     const isSynth = store.isSynthesisMode
     
     if(!g) return

     const highlightIds = new Set<string>()
     
     if (isSynth) {
       // Highlight Leaves
       const sourceIds = new Set(store.links.map((l: any) => typeof l.source === 'object' ? l.source.id : l.source))
       store.nodes.forEach(n => {
         if (!sourceIds.has(n.id)) highlightIds.add(n.id)
       })
     } else if (activeId) {
        // Ancestor Traversal
        const queue = [activeId]
        highlightIds.add(activeId)
        const visited = new Set<string>([activeId])
        
        while(queue.length > 0) {
           const curr = queue.shift()!
           // Incoming links
           store.links.forEach((l: any) => {
              const tId = typeof l.target === 'object' ? l.target.id : l.target
              if (tId === curr) {
                 const sId = typeof l.source === 'object' ? l.source.id : l.source
                 if (!visited.has(sId)) {
                    visited.add(sId)
                    highlightIds.add(sId)
                    queue.push(sId)
                 }
              }
           })
        }
     } else {
        // No selection -> Highlight All
        store.nodes.forEach(n => highlightIds.add(n.id))
     }

     // Apply Styles
     g.selectAll('.node-shape')
       .transition().duration(200)
       .attr('stroke', function(this: any) {
          const d = d3.select(this.parentNode).datum() as any
          const id = d.id
          
          if (isSynth) {
             return highlightIds.has(id) ? 'var(--color-node-highlight-synth)' : 'var(--color-node-inactive)'
          }
          if (id === activeId) return 'var(--color-node-active)' // Active Note
          if (highlightIds.has(id)) return 'var(--color-node-ancestor)' // Ancestor
          return 'var(--color-node-inactive)' // Inactive
       })
       .attr('stroke-width', function(this: any) {
          const d = d3.select(this.parentNode).datum() as any
          const id = d.id
          if (isSynth) return highlightIds.has(id) ? 3 : 1
          if (id === activeId) return 3
          return highlightIds.has(id) ? 2 : 1
       })
       .attr('opacity', function(this: any) {
          const d = d3.select(this.parentNode).datum() as any
          return highlightIds.has(d.id) ? 1 : 0.2
       })

     g.selectAll('.links path')
       .transition().duration(200)
       .attr('stroke', (d: any) => {
           const sId = typeof d.source === 'object' ? d.source.id : d.source
           const tId = typeof d.target === 'object' ? d.target.id : d.target
           // Logic: Link is active if both nodes are highlighted AND it's on the path?
           // If we just check highlightIds, any link between two ancestors is active.
           // This is correct contextually.
           if (highlightIds.has(sId) && highlightIds.has(tId)) return 'var(--color-link-active)'
           return 'var(--color-link-inactive)'
       })
       .attr('stroke-opacity', (d: any) => {
           const sId = typeof d.source === 'object' ? d.source.id : d.source
           const tId = typeof d.target === 'object' ? d.target.id : d.target
           if (highlightIds.has(sId) && highlightIds.has(tId)) return 0.6
           return 0.1
       })
  })
})

onUnmounted(() => {
  if (simulation) simulation.stop()
})

</script>

<template>
  <div ref="containerRef" class="graph-container">
    <svg ref="svgRef" class="graph-svg"></svg>
    
    <Teleport to="body">
       <div 
         v-if="tooltip.visible" 
         class="graph-tooltip"
         :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
       >
         <MarkdownRenderer :content="tooltip.content" />
       </div>
    </Teleport>
  </div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: transparent;
  position: absolute; /* Graph sits on top of background logo */
  top: 0;
  left: 0;
  z-index: 1;
}

.graph-svg {
  display: block;
  cursor: grab;
}

.graph-svg:active {
  cursor: grabbing;
}

.graph-tooltip {
  position: fixed;
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  pointer-events: none; /* Let events pass through so we can move mouse */
  z-index: 9999;
  backdrop-filter: blur(10px);
  font-size: 0.85rem;
  color: var(--color-text-primary);
}
</style>
