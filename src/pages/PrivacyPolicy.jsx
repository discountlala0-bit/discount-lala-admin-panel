import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getPrivacyPolicy, updatePrivacyPolicy } from '@/api/legal'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/shared/PageHeader'
import LegalSectionsEditor from '@/components/shared/LegalSectionsEditor'

export default function PrivacyPolicy() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: () => getPrivacyPolicy(),
  })
  const sections = data?.data?.content ?? []

  const updateMut = useMutation({
    mutationFn: updatePrivacyPolicy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['privacy-policy'] })
      toast.success('Privacy Policy updated')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update Privacy Policy'),
  })

  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        description="Manage the sections shown on the Privacy Policy screen in the app. Each section has a title and either a paragraph or a list of points."
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
