import { useRef, useState } from 'react'
import { uploadImage } from '@/api/upload'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function ImageUpload({ label = 'Image', value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImage(file)
      onChange(res.url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value && (
        <div className="relative w-full rounded-md overflow-hidden border bg-muted h-40">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        {uploading
          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
          : <><ImageIcon className="mr-2 h-4 w-4" />{value ? 'Replace Image' : 'Upload Image'}</>
        }
      </Button>
    </div>
  )
}
