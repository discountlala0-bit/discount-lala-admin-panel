import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Loader2 } from 'lucide-react'

function emptySection() {
  return { title: '', type: 'paragraph', text: '', items: [''] }
}

export default function LegalSectionsEditor({ initialSections, onSubmit, loading }) {
  const [sections, setSections] = useState(
    initialSections && initialSections.length > 0
      ? initialSections.map((s) => ({ items: [''], text: '', ...s }))
      : [emptySection()]
  )

  const updateSection = (index, patch) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index))
  }

  const addSection = () => {
    setSections((prev) => [...prev, emptySection()])
  }

  const updateBullet = (sIndex, bIndex, value) => {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sIndex) return s
        const items = [...s.items]
        items[bIndex] = value
        return { ...s, items }
      })
    )
  }

  const addBullet = (sIndex) => {
    setSections((prev) => prev.map((s, i) => (i === sIndex ? { ...s, items: [...s.items, ''] } : s)))
  }

  const removeBullet = (sIndex, bIndex) => {
    setSections((prev) =>
      prev.map((s, i) => (i === sIndex ? { ...s, items: s.items.filter((_, j) => j !== bIndex) } : s))
    )
  }

  const handleSave = () => {
    const cleaned = sections
      .map((s) => ({
        title: s.title.trim(),
        type: s.type,
        ...(s.type === 'paragraph'
          ? { text: (s.text || '').trim() }
          : { items: (s.items || []).map((i) => i.trim()).filter(Boolean) }),
      }))
      .filter((s) => s.title && (s.type === 'paragraph' ? s.text : s.items.length > 0))

    if (cleaned.length === 0) return
    onSubmit(cleaned)
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sIndex) => (
        <Card key={sIndex}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(sIndex, { title: e.target.value })}
                  placeholder="e.g. Introduction"
                />
              </div>
              <div className="w-44 space-y-2">
                <Label>Type</Label>
                <Select value={section.type} onValueChange={(v) => updateSection(sIndex, { type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="bullets">Bullet points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-7 shrink-0 text-destructive"
                onClick={() => removeSection(sIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {section.type === 'paragraph' ? (
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea
                  value={section.text}
                  onChange={(e) => updateSection(sIndex, { text: e.target.value })}
                  className="min-h-24"
                  placeholder="Paragraph content..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Points</Label>
                {section.items.map((item, bIndex) => (
                  <div key={bIndex} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateBullet(sIndex, bIndex, e.target.value)}
                      placeholder={`Point ${bIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      onClick={() => removeBullet(sIndex, bIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addBullet(sIndex)}>
                  <Plus className="mr-2 h-4 w-4" />Add Point
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={addSection}>
          <Plus className="mr-2 h-4 w-4" />Add Section
        </Button>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
