"use client";

/* eslint-disable @next/next/no-img-element */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/use-store";
import { useCallback, useRef, useState } from "react";
import { Badge } from "../ui/badge";

export default function PreviewPanel() {
  const { previewImage } = useAppStore();
  const [mockupScale, setMockupScale] = useState(1);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Callback ref to handle dynamic mounting/unmounting of the container
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) return;

    const handleResize = () => {
      // Find the parent wrapper to constrain dimensions
      const wrapper = node.parentElement;
      if (!wrapper) return;

      const { clientWidth, clientHeight } = wrapper;

      // Base size of mockup including handle and shadows
      // Mug body 300px + Handle ~40px + Margins
      const contentWidth = 380;
      const contentHeight = 400;

      // Calculate scale to fit with margin
      const scale = Math.min(
        (clientWidth * 0.9) / contentWidth,
        (clientHeight * 0.8) / contentHeight
      );

      // Ensure we don't disappear or blow up (limit max zoom if needed, e.g. 1.5)
      setMockupScale(Math.max(0.15, scale));
    };

    // Observe parent container
    const wrapper = node.parentElement;
    if (wrapper) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(wrapper);
      observerRef.current = observer;

      // Initial calculation
      handleResize();
    }
  }, []);

  if (!previewImage) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center p-4">
      <Tabs
        defaultValue="mockup"
        className="w-full h-full flex flex-col items-center"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="mockup">Mockup Mug</TabsTrigger>
          <TabsTrigger value="flat">À plat</TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
          <TabsContent
            value="mockup"
            className="relative w-full h-full flex items-center justify-center"
          >
            <div
              ref={setContainerRef}
              style={{ transform: `scale(${mockupScale})` }}
              className="origin-center transition-transform duration-200"
            >
              {/* Simple CSS Cylinder Mockup */}
              <div className="relative w-75 h-87.5">
                {/* Handle */}
                <div className="absolute top-15 -right-10 w-20 h-45 border-15 border-muted-foreground/20 rounded-r-[50px] -z-10" />

                {/* Mug Body */}
                <div
                  className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl border-t border-b border-border"
                  style={{
                    background:
                      "linear-gradient(90deg, #eee 0%, #fff 20%, #fff 80%, #eee 100%)",
                  }}
                >
                  {/* Image mapped on cylinder */}
                  {/* We show a part of the image, e.g. center */}
                  <div className="absolute inset-0 overflow-hidden mix-blend-multiply opacity-90">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full max-w-none absolute top-0 left-1/2 transform -translate-x-1/2"
                      style={{ height: "100%", width: "auto" }}
                    />
                  </div>

                  {/* Shine/Reflection Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="flat"
            className="relative w-full h-full flex items-center justify-center p-4"
          >
            <div className="bg-card shadow-lg p-2 border border-border max-w-full max-h-full overflow-auto">
              <img
                src={previewImage}
                alt="Flat Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Badge
        variant="outline"
        className="absolute bottom-4 right-4 pointer-events-none bg-background/80 backdrop-blur z-20"
      >
        {Math.round(mockupScale * 100)}%
      </Badge>
    </div>
  );
}
