import { create } from 'zustand'

type Tab = 'editor' | 'preview'
type Tool = 'select' | 'image' | 'text' | 'settings' | null

interface AppState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  
  activeTool: Tool
  setActiveTool: (tool: Tool) => void

  // Canvas state
  zoom: number
  setZoom: (zoom: number) => void
  
  // Persistence
  canvasState: object | null
  setCanvasState: (state: object | null) => void
  
  previewImage: string | null
  setPreviewImage: (image: string | null) => void

  // Selected object properties (simplified for UI)
  selectedObject: {
    type: string
    id?: string
    text?: string
    fontFamily?: string
    fill?: string
    fontSize?: number
    width?: number
    height?: number
    scaleX?: number
    scaleY?: number
    angle?: number
  } | null
  setSelectedObject: (obj: AppState['selectedObject']) => void // using any for now to accept fabric object or simplified props
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'editor',
  setActiveTab: (tab) => set({ activeTab: tab }),

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  zoom: 1,
  setZoom: (zoom) => set({ zoom }),

  canvasState: null,
  setCanvasState: (state) => set({ canvasState: state }),

  previewImage: null,
  setPreviewImage: (image) => set({ previewImage: image }),

  selectedObject: null,
  setSelectedObject: (obj) => set({ selectedObject: obj }),
}))
