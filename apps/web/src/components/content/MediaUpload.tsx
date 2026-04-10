'use client'
import { useState } from 'react'
import { Upload, X } from 'lucide-react'
interface MediaUploadProps { files: any[]; onChange: (files: any[]) => void }
export function MediaUpload({ files, onChange }: MediaUploadProps) {
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map(f => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))
    onChange([...files, ...newFiles])
  }
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-3">Media (optional)</label>
      <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-white/[0.12] hover:border-[#0066FF]/40 cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04]">
        <Upload className="w-5 h-5 text-white/30" />
        <span className="text-xs text-white/40">Drop images or videos here, or click to browse</span>
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFiles} />
      </label>
      {files.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
              <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
              <button onClick={() => onChange(files.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
