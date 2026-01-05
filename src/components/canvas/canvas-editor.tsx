"use client";

import { Badge } from "@/components/ui/badge";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/constants";
import { useAppStore } from "@/store/use-store";
import * as fabric from "fabric";
import { useEffect, useRef } from "react";

export default function CanvasEditor() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const {
    setSelectedObject,
    setZoom,
    zoom,
    canvasState,
    setCanvasState,
    setPreviewImage,
  } = useAppStore();

  // Initialize Canvas
  useEffect(() => {
    if (!canvasEl.current) return;

    // Fabric.js 6/7 initialization
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    let isDisposed = false;

    // Helper to save state
    const saveState = () => {
      if (isDisposed) return;
      setCanvasState(canvas.toJSON());
      // Generate preview
      const dataURL = canvas.toDataURL({ format: "png", multiplier: 0.5 });
      setPreviewImage(dataURL);
    };

    // Load state if exists
    if (canvasState) {
      canvas.loadFromJSON(canvasState, () => {
        if (isDisposed) return;
        canvas.renderAll();
        // Re-bind events or extra logic if needed after load
      });
    } else {
      // Initial save to ensure preview is available
      saveState();
    }

    // Selection events
    const updateSelection = () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        setSelectedObject({
          type: activeObj.type,
          // @ts-expect-error - fabric types might be tricky
          text: activeObj.text,
          // @ts-expect-error - fabric types might be tricky
          fontFamily: activeObj.fontFamily,
          fill: activeObj.fill as string,
          scaleX: activeObj.scaleX,
          scaleY: activeObj.scaleY,
          angle: activeObj.angle,
        });
      } else {
        setSelectedObject(null);
      }
    };

    // Save on modifications
    const onModified = () => {
      updateSelection();
      saveState();
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", updateSelection);
    canvas.on("object:modified", onModified);
    canvas.on("object:added", saveState);
    canvas.on("object:removed", saveState);

    // Event Listeners for Toolbar interactions
    const handleAddImage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      fabric.Image.fromURL(detail).then((img) => {
        img.set({
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          originX: "center",
          originY: "center",
        });
        // Scale down if too big
        if (img.width! > CANVAS_WIDTH / 2) {
          img.scaleToWidth(CANVAS_WIDTH / 2);
        }
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveState();
      });
    };

    const handleAddText = (e: Event) => {
      const text = (e as CustomEvent).detail;
      const textBox = new fabric.IText(text, {
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2,
        originX: "center",
        originY: "center",
        fontFamily: "Arial",
        fontSize: 100,
        fill: "#000000",
      });
      canvas.add(textBox);
      canvas.setActiveObject(textBox);
      canvas.renderAll();
      saveState();
    };

    const handleDeleteActive = () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        canvas.remove(activeObj);
        canvas.discardActiveObject();
        canvas.renderAll();
        saveState();
      }
    };

    const handleUpdateObject = (e: Event) => {
      const updates = (e as CustomEvent).detail;
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        activeObj.set(updates);
        canvas.renderAll();
        updateSelection(); // Update store
        saveState();
      }
    };

    const handleLayerAction = (e: Event) => {
      const action = (e as CustomEvent).detail;
      const activeObj = canvas.getActiveObject();
      if (!activeObj) return;

      switch (action) {
        case "front":
          canvas.bringObjectToFront(activeObj);
          break;
        case "back":
          canvas.sendObjectToBack(activeObj);
          break;
        case "forward":
          canvas.bringObjectForward(activeObj);
          break;
        case "backward":
          canvas.sendObjectBackwards(activeObj);
          break;
      }
      canvas.renderAll();
      saveState();
    };

    const handleRequestPreview = () => {
      // Still listen just in case, but store is primary
      const dataURL = canvas.toDataURL({ format: "png", multiplier: 0.5 });
      setPreviewImage(dataURL);
      window.dispatchEvent(
        new CustomEvent("preview-image-ready", { detail: dataURL })
      );
    };

    const handleExport = () => {
      // Check for text to decide on mirroring
      // Note: fabric types for objects might need checking
      const hasText = canvas
        .getObjects()
        .some((o) => o.type === "i-text" || o.type === "text");
      const shouldMirror = hasText;

      // Save current state
      const savedViewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const savedZoom = canvas.getZoom();

      // Reset to full view 1:1
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.setZoom(1);

      if (shouldMirror) {
        // Mirror horizontally: scaleX = -1, translateX = width
        canvas.setViewportTransform([-1, 0, 0, 1, CANVAS_WIDTH, 0]);
      }

      const dataURL = canvas.toDataURL({
        format: "png",
        multiplier: 1,
        quality: 1,
      });

      // Restore state
      canvas.setViewportTransform(savedViewport);
      canvas.setZoom(savedZoom);

      // Trigger download
      const link = document.createElement("a");
      link.download = `lempreinte-mug-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.addEventListener("add-image", handleAddImage);
    window.addEventListener("add-text", handleAddText);
    window.addEventListener("delete-active", handleDeleteActive);
    window.addEventListener("update-object", handleUpdateObject);
    window.addEventListener("layer-action", handleLayerAction);
    window.addEventListener("request-preview", handleRequestPreview);
    window.addEventListener("export-request", handleExport);

    return () => {
      // Final save on unmount
      saveState();

      isDisposed = true;

      window.removeEventListener("add-image", handleAddImage);
      window.removeEventListener("add-text", handleAddText);
      window.removeEventListener("delete-active", handleDeleteActive);
      window.removeEventListener("update-object", handleUpdateObject);
      window.removeEventListener("layer-action", handleLayerAction);
      window.removeEventListener("request-preview", handleRequestPreview);
      window.removeEventListener("export-request", handleExport);

      // Handle potential async dispose
      const disposeResult = canvas.dispose();
      if (disposeResult instanceof Promise) {
        disposeResult.catch((e) => console.error("Error disposing canvas:", e));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSelectedObject, setCanvasState, setPreviewImage]); // Added dependencies Handle Responsiveness (Scale to fit container)
  useEffect(() => {
    if (!containerRef.current || !canvasWrapperRef.current) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) return;

      // Calculate scale to fit
      // Add some padding (e.g. 40px) to ensure it doesn't touch edges
      const scaleX = (containerWidth - 40) / CANVAS_WIDTH;
      const scaleY = (containerHeight - 40) / CANVAS_HEIGHT;
      const scale = Math.min(scaleX, scaleY, 1);

      const wrapper = canvasWrapperRef.current;
      if (wrapper) {
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = "center center";
      }

      setZoom(scale);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(containerRef.current);
    resizeCanvas(); // initial

    return () => observer.disconnect();
  }, [setZoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-muted overflow-hidden relative"
    >
      <div
        ref={canvasWrapperRef}
        className="shadow-xl border border-border relative bg-white"
      >
        <canvas ref={canvasEl} />
      </div>

      <Badge
        variant="outline"
        className="absolute bottom-4 right-4 pointer-events-none bg-background/80 backdrop-blur"
      >
        {Math.round(zoom * 100)}%
      </Badge>
    </div>
  );
}
