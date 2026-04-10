'use client'
interface PostPreviewProps { caption: string; hashtags: string[]; mediaUrl?: string }
export function PostPreview({ caption, hashtags, mediaUrl }: PostPreviewProps) {
  return (
    <div>
      <p className="text-xs font-medium text-white/50 mb-3">Post preview</p>
      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        {mediaUrl ? (
          <div className="aspect-square bg-white/[0.04]"><img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" /></div>
        ) : (
          <div className="aspect-square bg-white/[0.04] flex items-center justify-center"><p className="text-white/20 text-xs text-center px-4">Upload media to preview your post</p></div>
        )}
        <div className="p-4">
          {caption ? (
            <p className="text-xs text-white/70 leading-relaxed line-clamp-4 mb-2">{caption}</p>
          ) : (
            <p className="text-xs text-white/20 italic mb-2">Your caption will appear here...</p>
          )}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.slice(0, 5).map(tag => (<span key={tag} className="text-[10px] text-[#0066FF]">{tag}</span>))}
              {hashtags.length > 5 && <span className="text-[10px] text-white/30">+{hashtags.length - 5} more</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
