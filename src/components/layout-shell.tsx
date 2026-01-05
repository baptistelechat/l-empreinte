"use client";

import CanvasEditor from "@/components/canvas/canvas-wrapper";
import PreviewPanel from "@/components/preview/preview-panel";
import Toolbar from "@/components/tools/toolbar";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Download, Menu } from "lucide-react";
// import { useAppStore } from '@/store/use-store' // No longer needed for tabs
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "./ui/badge";

export default function LayoutShell() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="flex-none h-14 border-b border-border bg-card flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">
            E
          </div>
          <h1 className="font-semibold text-foreground hidden sm:block">
            L&apos;Empreinte
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => window.dispatchEvent(new Event("export-request"))}
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
        <main className="flex-1 flex flex-col relative bg-muted/50 overflow-hidden">
          <ResizablePanelGroup
            id="main-layout-group"
            direction={isDesktop ? "horizontal" : "vertical"}
            className="size-full"
          >
            <ResizablePanel
              id="editor-panel"
              defaultSize={isDesktop ? 65 : 50}
              minSize={isDesktop ? 40 : 35}
            >
              <div className="flex h-full items-center justify-center relative">
                <Badge variant="default" className="absolute top-2 left-2 z-10">
                  Édition (2D)
                </Badge>
                <CanvasEditor />
              </div>
            </ResizablePanel>

            <ResizableHandle id="main-layout-handle" />

            <ResizablePanel
              id="preview-panel"
              defaultSize={isDesktop ? 35 : 50}
              minSize={isDesktop ? 20 : 35}
            >
              <div className="flex h-full items-center justify-center relative bg-muted/20">
                <Badge variant="default" className="absolute top-2 left-2 z-10">
                  Aperçu (Mug)
                </Badge>
                <PreviewPanel />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* Mobile Bottom Bar (Drawer Trigger) */}
          <div className="md:hidden flex-none h-16 bg-card border-t border-border flex items-center justify-around px-4 z-20">
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
  );
}
