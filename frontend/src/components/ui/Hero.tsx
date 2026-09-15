import type { ReactNode } from 'react'
import appIcon from '../../assets/brand/app-icon.png'

interface HeroProps {
  title: string
  subtitle: string
  /** When set, renders a Netflix-pattern featured backdrop hero instead of
   * the generic branding card — used on Home once there's real VOD data
   * to feature. */
  backdropUrl?: string | null
  action?: ReactNode
}

export default function Hero({ title, subtitle, backdropUrl, action }: HeroProps) {
  if (backdropUrl) {
    return (
      <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-xl sm:mb-8 md:mb-10 md:aspect-[21/9]">
        <img src={backdropUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
          <h1 className="max-w-lg text-xl font-extrabold text-text [text-wrap:balance] sm:text-2xl md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden sm:text-base">
            {subtitle}
          </p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-border bg-gradient-to-br from-card to-bg p-5 sm:mb-8 sm:gap-4 sm:p-6 md:mb-10 md:p-8">
      <img src={appIcon} alt="" className="h-10 w-10 rounded-xl sm:h-12 sm:w-12 md:h-14 md:w-14" />
      <div>
        <h1 className="text-xl font-extrabold text-text [text-wrap:balance] sm:text-2xl md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
