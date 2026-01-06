import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GraphNode {
    id: string
    type: 'user' | 'ai' | 'synthesis' | 'system'
    label: string
    summary?: string
    x?: number
    y?: number
    fx?: number | null
    fy?: number | null
}

export interface GraphLink {
    source: string | GraphNode
    target: string | GraphNode
}

export const useGraphStore = defineStore('graph', () => {
    const activeNodeId = ref<string | null>(null)
    const isSynthesisMode = ref(false)

    const selectedNodeIds = ref<string[]>([])
    const lastSelectedNodeId = ref<string | null>(null)

    const nodes = ref<GraphNode[]>([
        { id: 'root', type: 'system', label: 'System' },
    ])

    const links = ref<GraphLink[]>([])

    // Set initial active node
    activeNodeId.value = 'root'

    const setActiveNode = (id: string | null) => {
        // Legacy support if called directly
        activeNodeId.value = id
        if (id) {
            selectedNodeIds.value = [id]
            lastSelectedNodeId.value = id
        } else {
            selectedNodeIds.value = []
            lastSelectedNodeId.value = null
        }
    }

    const toggleNodeSelection = (id: string) => {
        const idx = selectedNodeIds.value.indexOf(id)
        if (idx > -1) {
            // Remove
            selectedNodeIds.value = selectedNodeIds.value.filter(existing => existing !== id)
            if (activeNodeId.value === id) activeNodeId.value = null
        } else {
            // Add
            selectedNodeIds.value = [...selectedNodeIds.value, id]
            activeNodeId.value = id
            lastSelectedNodeId.value = id
        }
    }

    const handleNodeClick = (id: string, ctrlKey: boolean, shiftKey: boolean) => {
        if (shiftKey && lastSelectedNodeId.value) {
            // Range Selection
            const startIdx = nodes.value.findIndex(n => n.id === lastSelectedNodeId.value)
            const endIdx = nodes.value.findIndex(n => n.id === id)

            if (startIdx !== -1 && endIdx !== -1) {
                const min = Math.min(startIdx, endIdx)
                const max = Math.max(startIdx, endIdx)

                const newSelection = new Set(selectedNodeIds.value)
                for (let i = min; i <= max; i++) {
                    const node = nodes.value[i]
                    if (node) newSelection.add(node.id)
                }
                selectedNodeIds.value = Array.from(newSelection)
            }
            activeNodeId.value = id
        } else if (ctrlKey) {
            // Discontinuous Selection
            toggleNodeSelection(id)
        } else {
            // Single Selection
            selectedNodeIds.value = [id]
            activeNodeId.value = id
            lastSelectedNodeId.value = id
        }

        // Auto-toggle Synthesis Mode based on selection count
        if (selectedNodeIds.value.length > 1) {
            isSynthesisMode.value = true
        } else {
            isSynthesisMode.value = false
        }
    }

    const toggleSynthesisMode = (val?: boolean) => {
        const newVal = val ?? !isSynthesisMode.value
        isSynthesisMode.value = newVal

        if (newVal) {
            // If turning ON and selection is not "multi" (or empty/single), select all leaves
            if (selectedNodeIds.value.length <= 1) {
                const sourceIds = new Set(links.value.map((l: any) => typeof l.source === 'object' ? l.source.id : l.source))
                const leafNodes = nodes.value.filter(n => !sourceIds.has(n.id))
                selectedNodeIds.value = leafNodes.map(n => n.id)
            }
        } else {
            // Turning OFF: Reset selection to single active node (or none)
            if (activeNodeId.value) {
                selectedNodeIds.value = [activeNodeId.value]
                lastSelectedNodeId.value = activeNodeId.value
            } else {
                selectedNodeIds.value = []
                lastSelectedNodeId.value = null
            }
        }
    }

    const addNode = (node: GraphNode) => {
        nodes.value.push(node)
        activeNodeId.value = node.id
        // Auto-select new node
        selectedNodeIds.value = [node.id]
        lastSelectedNodeId.value = node.id
    }

    const addLink = (link: GraphLink) => {
        links.value.push(link)
    }

    const getThread = (nodeId: string | null): GraphNode[] => {
        if (!nodeId) return []
        const thread: GraphNode[] = []
        let currId: string | null = nodeId
        const visited = new Set<string>()

        while (currId && !visited.has(currId)) {
            visited.add(currId)
            const node = nodes.value.find(n => n.id === currId)
            if (!node) break
            thread.unshift(node)

            // Break if we hit a synthesis node (that isn't the start node itself)
            // This treats synthesis nodes as roots of new conversation segments
            if (node.type === 'synthesis' && node.id !== nodeId) {
                // Actually, if we hit a synthesis node further up, we should encompass it?
                // No, per requirement: "History restarts after synthesis".
                // So if we traverse UP and find a synthesis node, that synthesis node should be the start (root) of this thread segment.
                // So we keep it in the thread (it's already unshifted) and then break.
                break
            }

            const link = links.value.find(l => {
                const tId = typeof l.target === 'object' ? (l.target as any).id : l.target
                return tId === currId
            })
            if (link) {
                currId = typeof link.source === 'object' ? (link.source as any).id : link.source as string
            } else {
                currId = null
            }
        }
        return thread
    }

    return {
        nodes,
        links,
        activeNodeId,
        selectedNodeIds,
        isSynthesisMode,
        toggleSynthesisMode,
        setActiveNode,
        handleNodeClick,
        addNode,
        addLink,
        getThread
    }
})
