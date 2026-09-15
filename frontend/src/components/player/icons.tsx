import type { SVGProps } from 'react'

/** Line icons for the player control bar — hand-authored, no icon library
 * dependency. 24x24 viewBox, consistent stroke weight, matching the brand
 * system's "simple, clean, primarily line-based" iconography direction. */

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function VolumeUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5v5h4l5 4v-13l-5 4H4Z" />
      <path d="M17 9a4.5 4.5 0 0 1 0 6" />
      <path d="M19.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  )
}

export function VolumeMuteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5v5h4l5 4v-13l-5 4H4Z" />
      <path d="m16 9.5 5 5" />
      <path d="m21 9.5-5 5" />
    </svg>
  )
}

export function PipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="14" rx="1.5" />
      <rect x="12.5" y="11.5" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FullscreenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M9 4.5H4.5V9" />
      <path d="M15 4.5h4.5V9" />
      <path d="M9 19.5H4.5V15" />
      <path d="M15 19.5h4.5V15" />
    </svg>
  )
}

export function CastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 6.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-4" />
      <rect x="3" y="16" width="4" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M3 13.5a5 5 0 0 1 5 5" />
      <path d="M3 10.5a8 8 0 0 1 8 8" />
    </svg>
  )
}

export function AirPlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5.5 15.5H4A1.5 1.5 0 0 1 2.5 14V6A1.5 1.5 0 0 1 4 4.5h16A1.5 1.5 0 0 1 21.5 6v8a1.5 1.5 0 0 1-1.5 1.5h-1.5" />
      <path d="M12 13.5 7.5 20.5h9L12 13.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Replay10Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 1 1 2.34 5.66" />
      <path d="M4 12V7" />
      <path d="M4 12H9" />
      <text x="12" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" textAnchor="middle">
        10
      </text>
    </svg>
  )
}

export function Forward10Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M20 12a8 8 0 1 0-2.34 5.66" />
      <path d="M20 12V7" />
      <path d="M20 12h-5" />
      <text x="12" y="15.5" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" textAnchor="middle">
        10
      </text>
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}
