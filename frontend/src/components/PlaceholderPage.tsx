interface PlaceholderPageProps {
  title: string
  description: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="page-gutter py-10">
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      <p className="mt-2 max-w-prose text-muted">{description}</p>
    </div>
  )
}
