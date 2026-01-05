'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Toolbar from '@/components/tools/toolbar'
import CanvasEditor from '@/components/canvas/canvas-wrapper'
import PreviewPanel from '@/components/preview/preview-panel'
import { Button } from '@/components/ui/button'
import { Menu, Download } from 'lucide-react'
import { useAppStore } from '@/store/use-store'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'

export default function LayoutShell() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none h-14 border-b border-border bg-card flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">
            E
          </div>
          <h1 className="font-semibold text-foreground hidden sm:block">L&apos;Empreinte</h1>
        </div>
        
        <div className="flex items-center gap-2">
           <Button 
             size="sm" 
             className="gap-2"
             onClick={() => window.dispatchEvent(new Event('export-request'))}
           >
             <Download className="w-4 h-4" />
             Exporter
           </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Tools + Settings) */}
        <aside className="hidden md:flex w-80 flex-col border-r border-border bg-card z-10">
          <Toolbar />
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 flex flex-col relative bg-muted/50">
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'editor' | 'preview')}
            className="flex-1 flex flex-col"
          >
            <div className="flex-none p-2 flex justify-center border-b border-border/50 bg-background/50 backdrop-blur-sm">
              <TabsList>
                <TabsTrigger value="editor">Édition (2D)</TabsTrigger>
                <TabsTrigger value="preview">Aperçu (Mug)</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <TabsContent value="editor" className="absolute inset-0 m-0 border-0 h-full w-full data-[state=inactive]:hidden">
                 <CanvasEditor />
              </TabsContent>
              <TabsContent value="preview" className="absolute inset-0 m-0 border-0 h-full w-full data-[state=inactive]:hidden">
                 <PreviewPanel />
              </TabsContent>
            </div>
          </Tabs>

          {/* Mobile Bottom Bar (Drawer Trigger) */}
          <div className="md:hidden flex-none h-16 bg-card border-t border-border flex items-center justify-around px-4">
             <Drawer>
               <DrawerTrigger asChild>
                 <Button variant="outline" className="w-full">
                   <Menu className="w-4 h-4 mr-2" />
                   Outils & Réglages
                 </Button>
               </DrawerTrigger>
               <DrawerContent className="h-[50vh]">
                 <div className="p-4 h-full overflow-auto">
                   <Toolbar />
                 </div>
               </DrawerContent>
             </Drawer>
          </div>
        </main>
      </div>
    </div>
  )
}
