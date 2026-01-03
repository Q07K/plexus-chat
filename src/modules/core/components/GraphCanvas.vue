<script setup lang="ts">
import { onMounted, ref, onUnmounted, watchEffect } from 'vue'
import * as d3 from 'd3'
import { useResizeObserver } from '@vueuse/core'
import { useGraphStore } from '../stores/graphStore'

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

const render = () => {
  // Render Links
  // We use a group for links to keep them behind nodes
  let linkGroup = g.select<SVGGElement>('.links')
  if (linkGroup.empty()) {
    linkGroup = g.append('g').attr('class', 'links')
  }

  const link = linkGroup.selectAll('path')
      .data(store.links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)

  // Render Nodes
  // We use a group for nodes
  let nodeGroup = g.select<SVGGElement>('.nodes')
  if (nodeGroup.empty()) {
    nodeGroup = g.append('g').attr('class', 'nodes')
  }

  // We need to use a key function for data joining to ensure state preservation on updates
  const node = nodeGroup.selectAll<SVGGElement, d3.SimulationNodeDatum>('.node-group')
      .data(store.nodes, (d: any) => d.id)
      .join(
        enter => {
          const group = enter.append('g').attr('class', 'node-group')
          
          // User Node: Rounded Rect
          group.filter((d: any) => d.type === 'user')
               .append('rect')
               .attr('width', 40)
               .attr('height', 40)
               .attr('x', -20)
               .attr('y', -20)
               .attr('rx', 10)
               .attr('fill', '#6366f1')
               .attr('stroke', '#fff')
               .attr('stroke-width', 1.5)

          // AI / Synthesis Node: Circle
          group.filter((d: any) => d.type !== 'user')
               .append('circle')
               .attr('r', (d: any) => d.type === 'synthesis' ? 25 : 20)
               .attr('fill', (d: any) => d.type === 'synthesis' ? '#f59e0b' : '#10b981')
               .attr('stroke', '#fff')
               .attr('stroke-width', (d: any) => d.type === 'synthesis' ? 3 : 1.5)
          
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

  // Watch effect for highlighting... (kept same logic, assuming external watchEffect covers it via re-selection)
  // Actually the watchEffect updates attributes on existing nodes. 
  // It selects '.node-group rect' etc. so it works fine even after re-render/join.

  simulation.nodes(store.nodes as d3.SimulationNodeDatum[])
  simulation.force<d3.ForceLink<any, any>>('link')?.links(store.links)
  simulation.alpha(1).restart()
  
  simulation.on('tick', () => {
    link.attr('d', (d: any) => {
        const sx = d.source.x
        const sy = d.source.y
        const tx = d.target.x
        const ty = d.target.y
        // Cubic Bezier for vertical tree: M start C c1 c2 end
        // Control points: vertical offset from start and end
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
     g.selectAll('.node-group rect, .node-group circle')
       .transition().duration(200)
       .attr('stroke', function(this: any) {
          const d = d3.select(this.parentNode).datum() as any
          const id = d.id
          
          if (isSynth) {
             return highlightIds.has(id) ? '#3b82f6' : '#334155'
          }
          if (id === activeId) return '#fcd34d' // Gold
          if (highlightIds.has(id)) return '#fff' // Ancestor
          return '#334155' // Inactive
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
           if (highlightIds.has(sId) && highlightIds.has(tId)) return '#94a3b8'
           return '#334155'
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
</style>
