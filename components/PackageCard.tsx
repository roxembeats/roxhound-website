'use client'

import { useAppStore } from '@/store/useAppStore'

interface LineItem {
  name: string
  price: number
  priceLabel?: string
}

interface Section {
  label: string
  required: boolean
  items: LineItem[]
  subtotal?: number
}

export interface PackageData {
  trackName: string
  sections: Section[]
  total: number
}

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

export default function PackageCard({ data }: { data: PackageData }) {
  const accentColor = useAppStore((s) => s.accentColor)

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 text-sm w-full">
      {/* Track header */}
      <div
        className="px-3 py-2 font-semibold text-white uppercase tracking-wide text-xs"
        style={{ background: accentColor }}
      >
        {data.trackName}
      </div>

      {/* Sections */}
      {data.sections.map((section, i) => (
        <div key={i} className="border-t border-white/10 first:border-t-0">
          {/* Section label */}
          <div className="px-3 py-1.5 bg-white/5 flex items-center justify-between">
            <span className="text-white/60 text-xs font-medium">{section.label}</span>
            {section.required && (
              <span className="text-[10px] text-white/40 border border-white/20 rounded px-1">required</span>
            )}
          </div>

          {/* Line items */}
          {section.items.map((item, j) => (
            <div key={j} className="px-3 py-1.5 flex justify-between items-center border-t border-white/5">
              <span className="text-white/80">{item.name}</span>
              <span className="text-white/60 tabular-nums shrink-0 ml-4">
                {fmt(item.price)}{item.priceLabel ?? ''}
              </span>
            </div>
          ))}

          {/* Section subtotal */}
          {section.subtotal != null && (
            <div className="px-3 py-1.5 flex justify-between items-center border-t border-white/10 bg-white/5">
              <span className="text-white/50 text-xs">Subtotal</span>
              <span className="text-white/70 tabular-nums text-xs">{fmt(section.subtotal)}</span>
            </div>
          )}
        </div>
      ))}

      {/* Grand total */}
      <div
        className="px-3 py-2.5 flex justify-between items-center border-t border-white/20"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <span className="text-white font-semibold">Package Total</span>
        <span className="text-white font-bold tabular-nums" style={{ color: accentColor }}>
          {fmt(data.total)}
        </span>
      </div>
    </div>
  )
}
