'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/use-store'

export default function PreviewPanel() {
  const { previewImage } = useAppStore()
  const mockupContainerRef = useRef<HTMLDivElement>(null)
  const [mockupScale, setMockupScale] = useState(1)

  // Responsive Mockup Logic
  useEffect(() => {
    if (!mockupContainerRef.current) return

    const handleResize = () => {
      const container = mockupContainerRef.current?.parentElement
      if (!container) return

      const { clientWidth, clientHeight } = container
      // Base size of mockup is 300x350 + some margin
      const targetW = 340
      const targetH = 390
      
      const scale = Math.min(
        clientWidth / targetW,
        clientHeight / targetH,
        1
      )
      setMockupScale(scale)
    }

    const observer = new ResizeObserver(handleResize)
    // We observe the TabsContent or the wrapper
    // Since TabsContent might not be rendered initially if not active, we need to be careful.
    // However, if we put the ref on the div inside TabsContent, it will run when mounted.
    if (mockupContainerRef.current.parentElement) {
        observer.observe(mockupContainerRef.current.parentElement)
    }
    
    handleResize()

    return () => observer.disconnect()
  }, []) // dependency array empty might be fine if ref is stable, but if we switch tabs, we might re-mount.
  // Actually, TabsContent unmounts when hidden? 
  // Radix Tabs usually keeps content mounted with forceMount? Default is unmount.
  // So when we switch to "mockup", this effect runs.

  if (!previewImage) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Chargement...</div>
  }

  return (
    <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center p-4">
      <Tabs defaultValue="mockup" className="w-full h-full flex flex-col items-center">
        <TabsList className="mb-4">
          <TabsTrigger value="mockup">Mockup Mug</TabsTrigger>
          <TabsTrigger value="flat">À plat</TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <TabsContent value="mockup" className="relative w-full h-full flex items-center justify-center">
                <div 
                    ref={mockupContainerRef}
                    style={{ transform: `scale(${mockupScale})` }} 
                    className="origin-center transition-transform duration-200"
                >
                    {/* Simple CSS Cylinder Mockup */}
                    <div className="relative w-[300px] h-[350px]">
                        {/* Handle */}
                        <div className="absolute top-[60px] -right-[40px] w-[80px] h-[180px] border-[15px] border-muted-foreground/20 rounded-r-[50px] -z-10" />
                        
                        {/* Mug Body */}
                        <div className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl border-t border-b border-border"
                             style={{ 
                                 background: 'linear-gradient(90deg, #eee 0%, #fff 20%, #fff 80%, #eee 100%)',
                             }}
                        >
                             {/* Image mapped on cylinder */}
                             {/* We show a part of the image, e.g. center */}
                             <div className="absolute inset-0 overflow-hidden mix-blend-multiply opacity-90">
                                 <img 
                                   src={previewImage} 
                                   alt="Preview" 
                                   className="h-full max-w-none absolute top-0 left-1/2 transform -translate-x-1/2"
                                   style={{ height: '100%', width: 'auto' }} 
                                 />
                             </div>
                             
                             {/* Shine/Reflection Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="flat" className="relative w-full h-full flex items-center justify-center p-4">
                <div className="bg-card shadow-lg p-2 border border-border max-w-full max-h-full overflow-auto">
                    <img src={previewImage} alt="Flat Preview" className="max-w-full max-h-full object-contain" />
                </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
