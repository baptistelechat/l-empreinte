'use client'

import dynamic from 'next/dynamic'

const CanvasEditor = dynamic(() => import('./canvas-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
      Chargement du studio...
    </div>
  ),
})

export default CanvasEditor
