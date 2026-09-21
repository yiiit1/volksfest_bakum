import common from '@/content/common.json'

export default function Loading(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="status"
        aria-label={common.a11y.loading}
        className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
      />
    </div>
  )
}
