import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getTermsAndConditions, updateTermsAndConditions } from '@/api/legal'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import LegalSectionsEditor from '@/components/shared/LegalSectionsEditor'

export default function TermsAndConditions() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['terms-and-conditions'],
    queryFn: () => getTermsAndConditions(),
  })
  const sections = data?.data?.content ?? []

  const updateMut = useMutation({
    mutationFn: updateTermsAndConditions,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terms-and-conditions'] })
      toast.success('Terms & Conditions updated')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update Terms & Conditions'),
  })

  return (
    <div>
      <PageHeader
        title="Terms & Conditions"
        description="Manage the sections shown on the Terms & Conditions screen in the app. Each section has a title and either a paragraph or a list of points."
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <LegalSectionsEditor
          key={JSON.stringify(sections)}
          initialSections={sections}
          onSubmit={(value) => updateMut.mutate(value)}
          loading={updateMut.isPending}
        />
      )}
    </div>
  )
}
