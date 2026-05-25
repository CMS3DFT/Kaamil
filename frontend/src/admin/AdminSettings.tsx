import { useState } from 'react'
import { api } from '../api'

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Password-yada cusub isma laha.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password waa inuu ugu yaraan 6 xaraf yahay.')
      return
    }

    setLoading(true)
    try {
      await api.adminChangePassword(currentPassword, newPassword)
      setMessage('Password-kaaga waa la beddelay si guul leh.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Beddel password-ka admin-kaaga</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {message && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-4 rounded-xl bg-pink-50 px-4 py-3 text-sm text-pink-700">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Password-ka hadda
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password cusub
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Xaqiiji password cusub
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-500 py-3.5 font-semibold text-white transition hover:bg-pink-400 disabled:opacity-60"
          >
            {loading ? 'Kaydinaya...' : 'Beddel password'}
          </button>
        </form>
      </div>
    </div>
  )
}
