import type { ReactNode } from 'react'

interface LegalLayoutProps {
  title: string
  version: string
  children: ReactNode
}

export default function LegalLayout({ title, version, children }: LegalLayoutProps) {
  return (
    <div className="page-gutter py-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        <p className="mt-1 text-xs text-muted">Version {version}</p>

        <div className="legal-content mt-6 flex flex-col gap-4 text-sm leading-relaxed text-text">{children}</div>
      </div>
    </div>
  )
}
