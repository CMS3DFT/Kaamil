import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { getToken, isAdmin, setSession } from '../auth'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate(isAdmin() ? '/admin' : '/', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Fadlan buuxi dhammaan meelaha.')
      return
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('Fadlan geli magacaaga.')
        return
      }
      if (password.length < 6) {
        setError('Password waa inuu ugu yaraan 6 xaraf yahay.')
        return
      }
      if (password !== confirmPassword) {
        setError('Password-yada isma laha.')
        return
      }
    }

    setLoading(true)
    try {
      const result =
        mode === 'login'
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), password, fullName.trim())

      setSession(result.token, result.email, result.role, result.fullName)
      navigate(result.role === 'Admin' ? '/admin' : '/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay. Isku day mar kale.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-pink-600 via-pink-500 to-rose-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white backdrop-blur">
            K
          </div>
          <h1 className="mt-10 text-4xl font-bold leading-tight text-white">Kaamil Maal</h1>
          <p className="mt-4 max-w-md text-lg text-pink-100">
            Maamul dakhligaaga, kharashaadkaaga, iyo kaydkaaga si fudud oo professional ah.
          </p>
        </div>
        <ul className="space-y-4 text-pink-50">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm">✓</span>
            Is diiwaangeli bilaash — kadib soo gal
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm">✓</span>
            Dashboard qurxoon oo leh sidebar
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm">✓</span>
            Transactions, categories, iyo wadarta bisha
          </li>
        </ul>
        <p className="text-sm text-pink-200/80">© 2026 Kaamil Maal</p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500 text-xl font-bold text-white">
              K
            </div>
            <h1 className="text-2xl font-bold text-white">Kaamil Maal</h1>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex rounded-xl bg-slate-900/60 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError('')
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === 'register' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Diiwaangeli
              </button>
            </div>

            <h2 className="mb-1 text-xl font-bold text-white">
              {mode === 'login' ? 'Soo gal account-kaaga' : 'Is diiwaangeli'}
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              {mode === 'login'
                ? 'Geli email iyo password.'
                : 'Abuur account, kadib si toos ah ayaad u gashaa dashboard-ka.'}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <p className="rounded-xl bg-pink-500/15 px-4 py-3 text-sm text-pink-300">{error}</p>
              )}

              {mode === 'register' && (
                <label className="block text-sm font-medium text-slate-300">
                  Magaca oo buuxa
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    placeholder="Tusaale: Kaamil Ali"
                  />
                </label>
              )}

              <label className="block text-sm font-medium text-slate-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                  placeholder="email@example.com"
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                  placeholder="••••••••"
                />
              </label>

              {mode === 'register' && (
                <label className="block text-sm font-medium text-slate-300">
                  Xaqiiji password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                    placeholder="••••••••"
                  />
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-pink-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-pink-400 disabled:opacity-60"
              >
                {loading ? 'Sugaya...' : mode === 'login' ? 'Login' : 'Diiwaangeli & Soo gal'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  Ma haysatid account?{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-pink-400 hover:underline">
                    Is diiwaangeli
                  </button>
                </>
              ) : (
                <>
                  Hore u diiwaangashanayd?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-pink-400 hover:underline">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
