import { useCallback, useEffect, useState } from 'react'
import { api, type Report } from '../../api'

export default function UserReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setReports(await api.getMyReports())
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Ma suurtogelin in la soo qaado.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    if (!message.trim()) {
      setFeedback({ type: 'err', text: 'Fadlan qor warbixintaada halkan.' })
      return
    }
    setSending(true)
    try {
      await api.sendReport(message.trim())
      setMessage('')
      setFeedback({ type: 'ok', text: 'Waa la diray! Admin wuu akhrin doonaa.' })
      await load()
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Khalad ayaa dhacay.',
      })
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ma tirtirtaa?')) return
    try {
      await api.deleteReport(id)
      setFeedback({ type: 'ok', text: 'Waa la tirtiray.' })
      await load()
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Khalad ayaa dhacay.',
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-pink-100 bg-white shadow-lg shadow-pink-100/50 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">U dir Admin-ka</h1>
          <p className="mt-1 text-pink-100 text-sm">
            Hal meel — qor waxaad rabto, kadib taabo Send. Ma jiraan fayl.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {feedback && (
            <p
              className={`rounded-xl px-4 py-3 text-sm ${
                feedback.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-pink-50 text-pink-700'
              }`}
            >
              {feedback.text}
            </p>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Qor halkan
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Tusaale: Waxaan rabaa in la ii caawiyo lacagta bisha, ama wax kasta oo aad rabto in admin-ku ogaado..."
                className="mt-2 w-full rounded-2xl border-2 border-pink-200 px-4 py-4 text-slate-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-400/20"
              />
            </label>

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 py-4 text-lg font-semibold text-white shadow-lg shadow-pink-300/40 transition hover:from-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? 'Diraya...' : 'Send'}
            </button>
          </form>

          <div className="border-t border-pink-100 pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Kuwa aad hore u dirtay
            </h2>
            {loading ? (
              <p className="mt-4 text-slate-400">Sugaya...</p>
            ) : reports.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">Weli wax ma aadan dirin.</p>
            ) : (
              <ul className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {reports.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl bg-pink-50/80 px-4 py-3 text-sm text-slate-700"
                  >
                    <p className="whitespace-pre-wrap">{r.message}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{r.createdAt}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="text-red-500 hover:underline"
                      >
                        Tirtir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
