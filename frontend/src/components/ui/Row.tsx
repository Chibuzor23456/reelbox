import { Children, type ReactNode } from 'react'

interface RowProps {
  title: string
  itemWidthClass?: string
  children: ReactNode
}

export default function Row({ title, itemWidthClass = 'w-32', children }: RowProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-text">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Children.map(children, (child) => (
          <div className={`${itemWidthClass} flex-none`}>{child}</div>
        ))}
      </div>
    </section>
  )
}
