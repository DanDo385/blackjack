'use client'

interface StatsCardsProps {
  data: Record<string, number | string>
}

export default function StatsCards({ data }: StatsCardsProps) {
  const entries = Object.entries(data)

  if (entries.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-900 p-6 text-center text-neutral-400">
        No account stats available yet.
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-neutral-700 bg-neutral-900 p-5 shadow-sm transition hover:border-green-500/60"
        >
          <div className="text-sm font-medium text-neutral-400">{label}</div>
          <div className="mt-2 text-2xl font-mono font-semibold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
      ))}
    </div>
  )
}
