import type { Route } from '../router'

const PATHS: Record<Exclude<Route, 'view'>, string> = {
  home: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  timeline: 'M5 4h14v16H5zM5 9h14M9 3v3m6-3v3M8.5 13h2m3 0h2m-7 3.5h2',
  venue: 'M3 20h18M5 20V10l7-5 7 5v10M10 20v-5a2 2 0 0 1 4 0v5',
  sdm: 'M9 3h6l-1 4 3 4-2 10H9L7 11l3-4z',
  honeymoon: 'M2 16l20-8-6 12-3-5-5 3 1-5zM13 15l9-7',
  more: 'M3 15 21 9M8 13l-1 7m10-9-2 6M12 5a2 2 0 1 0 0 .01',
  policy: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',
  budget: 'M4 6h16v12H4zM4 10h16M8 14h3',
  share: 'M16 6a2 2 0 1 0 0 .01M6 12a2 2 0 1 0 0 .01M16 18a2 2 0 1 0 0 .01M8 11l6-4m-6 6 6 4',
}

export function RouteIcon({ id, className }: { id: Route; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[id === 'view' ? 'share' : id]} />
    </svg>
  )
}

export function Rings({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#8E3445" />
      <circle cx="12.5" cy="17" r="6" fill="none" stroke="#F7F1E8" strokeWidth="2.2" />
      <circle cx="19.5" cy="17" r="6" fill="none" stroke="#D9B26F" strokeWidth="2.2" />
      <path d="M19.5 8.2l1.6-1.8h-3.2z" fill="#D9B26F" />
    </svg>
  )
}
