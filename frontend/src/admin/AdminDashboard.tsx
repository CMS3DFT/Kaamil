import { useEffect, useState } from 'react'
import { api, type AdminStats } from '../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.adminGetStats()
      .then(setStats)
      .catch(() => setError('Ma suurtogelin in la soo qaado xogta.'))
  }, [])

  if (error) {
    return <p className="text-pink-600">{error}</p>
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', color: 'from-pink-500 to-rose-500' },
    { label: 'Active Users', value: stats?.activeUsers ?? '—', color: 'from-violet-500 to-purple-600' },
    { label: 'Transactions', value: stats?.totalTransactions ?? '—', color: 'from-slate-700 to-slate-900' },
    { label: 'Reports', value: stats?.totalReports ?? '—', color: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Guud ahaan nidaamka Kaamil Maal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-xl`}
          >
            <p className="text-sm font-medium text-white/80">{card.label}</p>
            <p className="mt-3 text-4xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Quick guide</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>• Users — abuur, wax ka beddel, tirtir isticmaalayaasha</li>
          <li>• Warbixinnada — akhri qoraallada users u soo diray</li>
          <li>• Settings — beddel password-ka admin</li>
          <li>• User cusub wuxuu helayaa categories default marka uu login gareeyo</li>
        </ul>
      </div>
    </div>
  )
}
