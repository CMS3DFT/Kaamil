import { useCallback, useEffect, useState } from 'react'
import { api, type Report } from '../api'

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setReports(await api.adminGetReports())
    } catch {
      setError('Ma suurtogelin in la soo qaado warbixinnada.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Ma tirtirtaa warbixintan?')) return
    try {
      await api.adminDeleteReport(id)
      setMessage('Waa la tirtiray.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Warbixinnada Users</h2>
        <p className="text-slate-500">Qoraallada users-ka u soo diray</p>
      </div>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-pink-50 px-4 py-3 text-sm text-pink-700">{error}</p>}

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
          Weli ma jiraan warbixin la soo diray.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-pink-500">User</p>
                  <p className="font-semibold text-slate-900">{r.userFullName ?? '—'}</p>
                  <p className="text-sm text-slate-500">{r.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{r.createdAt}</p>
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                    >
                      {expandedId === r.id ? 'Xir' : 'Akhri'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">{r.title}</h3>

              {(expandedId === r.id || r.message) && (
                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {r.message || '(Warbixin madhan)'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
