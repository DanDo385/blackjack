'use client'

import clsx from 'clsx'
import { useState } from 'react'

const RANGES = ['24h', '7d', '30d', 'All'] as const

type RangeValue = (typeof RANGES)[number]

interface TimeRangeTabsProps {
  onPick: (value: RangeValue) => void
}

export default function TimeRangeTabs({ onPick }: TimeRangeTabsProps) {
  const [active, setActive] = useState<RangeValue>('7d')

  const handleSelect = (range: RangeValue) => {
    setActive(range)
    onPick(range)
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => handleSelect(range)}
          className={clsx(
            'rounded-full border px-4 py-2 text-sm font-medium transition',
            active === range
              ? 'border-green-500 bg-green-500/10 text-green-200'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-green-500/60 hover:text-white'
          )}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
