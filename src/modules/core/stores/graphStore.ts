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

    const nodes = ref<GraphNode[]>([
        { id: 'root', type: 'system', label: 'System' },
    ])

    const links = ref<GraphLink[]>([])

    // Set initial active node
    activeNodeId.value = 'root'

    const setActiveNode = (id: string | null) => {
        if (isSynthesisMode.value) return // Disable single select in synthesis mode? Or maybe clicking toggles selection? 
        // Spec says: "Leaf nodes become active". 
        // Let's implement toggle logic later if needed.
        activeNodeId.value = id
    }

    const toggleSynthesisMode = (val?: boolean) => {
        isSynthesisMode.value = val ?? !isSynthesisMode.value
    }

    const addNode = (node: GraphNode) => {
        nodes.value.push(node)
        // Auto-select new user nodes? Or stay on the branching point?
        // Usually in chat, you want to follow the conversation, so let's select the NEW node.
        activeNodeId.value = node.id
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
        isSynthesisMode,
        toggleSynthesisMode,
        setActiveNode,
        addNode,
        addLink,
        getThread
    }
})
