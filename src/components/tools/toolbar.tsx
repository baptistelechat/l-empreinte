'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-store'
import { Image as ImageIcon, Type, Trash2, ArrowUp, ArrowDown, BringToFront, SendToBack } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Toolbar() {
  const { selectedObject } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (f) => {
        const data = f.target?.result as string
        window.dispatchEvent(new CustomEvent('add-image', { detail: data }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddText = () => {
    window.dispatchEvent(new CustomEvent('add-text', { detail: 'Nouveau texte' }))
  }

  const handleDelete = () => {
    window.dispatchEvent(new CustomEvent('delete-active'))
  }

  const handlePropertyChange = (prop: string, value: string | number) => {
    window.dispatchEvent(new CustomEvent('update-object', { detail: { [prop]: value } }))
  }

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    window.dispatchEvent(new CustomEvent('layer-action', { detail: action }))
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Settings Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Quick Actions (Always Visible if no selection or even with selection?) 
            User asked to replace tabs with buttons "New Text" and "New Image".
            It makes sense to have them always available at the top.
        */}
        <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Ajouter</h3>
            <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleAddText} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                    <Type className="h-6 w-6" />
                    <span className="text-xs">Texte</span>
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-xs">Image</span>
                </Button>
            </div>
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
            />
        </div>

        {/* Selected Object Properties */}
        {selectedObject && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200 pt-4 border-t border-border">
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-medium text-sm">
                {selectedObject.type === 'i-text' || selectedObject.type === 'text' ? 'Modifier le texte' : "Modifier l'image"}
              </h3>
              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleDelete} title="Supprimer">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Layer Management */}
            <div className="space-y-3">
                <Label>Disposition (Calques)</Label>
                <div className="flex items-center gap-1 justify-between">
                    <Button variant="outline" size="icon" onClick={() => handleLayerAction('front')} title="Premier plan">
                        <BringToFront className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleLayerAction('forward')} title="Avancer">
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleLayerAction('backward')} title="Reculer">
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleLayerAction('back')} title="Arrière plan">
                        <SendToBack className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Common Properties */}
            <div className="space-y-3">
               <Label>Rotation ({Math.round(selectedObject.angle || 0)}°)</Label>
               <Slider 
                 value={[selectedObject.angle || 0]} 
                 min={0} max={360} step={1}
                 onValueChange={(v) => handlePropertyChange('angle', v[0])}
               />
            </div>

            <div className="space-y-3">
               <Label>Échelle ({Math.round((selectedObject.scaleX || 1) * 100)}%)</Label>
               <Slider 
                 value={[(selectedObject.scaleX || 1) * 100]} 
                 min={10} max={300} step={1}
                 onValueChange={(v) => {
                   const s = v[0] / 100
                   handlePropertyChange('scaleX', s)
                   handlePropertyChange('scaleY', s)
                 }}
               />
            </div>

            {/* Text Specific */}
            {(selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
              <>
                 <div className="space-y-3">
                   <Label>Contenu</Label>
                   <input 
                     type="text" 
                     value={selectedObject.text || ''}
                     onChange={(e) => handlePropertyChange('text', e.target.value)}
                     className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                   />
                 </div>
                 
                 <div className="space-y-3">
                   <Label>Police</Label>
                   <Select
                     value={selectedObject.fontFamily || 'Arial'}
                     onValueChange={(val) => handlePropertyChange('fontFamily', val)}
                   >
                     <SelectTrigger className="w-full">
                       <SelectValue placeholder="Choisir une police" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Arial">Arial</SelectItem>
                       <SelectItem value="Helvetica">Helvetica</SelectItem>
                       <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                       <SelectItem value="Courier New">Courier New</SelectItem>
                       <SelectItem value="Verdana">Verdana</SelectItem>
                       <SelectItem value="Georgia">Georgia</SelectItem>
                       <SelectItem value="Impact">Impact</SelectItem>
                       <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="space-y-3">
                   <Label>Couleur</Label>
                   <div className="flex gap-2 flex-wrap">
                      {['#000000', '#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'].map(c => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full border border-border ${selectedObject.fill === c ? 'ring-2 ring-ring ring-offset-1' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => handlePropertyChange('fill', c)}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={selectedObject.fill as string || '#000000'}
                        onChange={(e) => handlePropertyChange('fill', e.target.value)}
                        className="w-8 h-8 p-0 border-0 rounded-md overflow-hidden"
                      />
                   </div>
                 </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
