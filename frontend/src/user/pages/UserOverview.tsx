import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../UserContext'

export default function UserOverview() {
  const {
    transactions,
    savedIncome,
    savedExpense,
    savedSavings,
    totalIncome,
    totalExpense,
    loading,
    updateTotals,
  } = useUser()

  const [editedIncome, setEditedIncome] = useState('0')
  const [editedExpense, setEditedExpense] = useState('0')
  const [editedSavings, setEditedSavings] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEditedIncome(savedIncome.toString())
    setEditedExpense(savedExpense.toString())
    setEditedSavings(savedSavings.toString())
  }, [savedIncome, savedExpense, savedSavings])

  const recent = transactions.slice(0, 6)
  const netBalance = savedIncome - savedExpense

  const handleSaveTotals = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const income = Number(editedIncome)
      const expense = Number(editedExpense)
      const savings = Number(editedSavings)
      await updateTotals(
        !Number.isNaN(income) && income >= 0 ? income : savedIncome,
        !Number.isNaN(expense) && expense >= 0 ? expense : savedExpense,
        !Number.isNaN(savings) && savings >= 0 ? savings : savedSavings,
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-5 text-white shadow-xl shadow-pink-300/30 sm:rounded-3xl sm:p-8">
        <p className="text-sm text-pink-100 sm:text-base">Dashboard-kaaga</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Ku soo dhawoow, Kaamil Maal</h1>
        <p className="mt-2 max-w-xl text-pink-100">
          Halkan ka arag wadarta dakhliga, kharashaadka, iyo liiska transactions-ka ugu dambeeyay.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/add"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-pink-600 shadow hover:bg-pink-50"
          >
            + Transaction cusub
          </Link>
          <Link
            to="/transactions"
            className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Eeg dhammaan
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dakhliga (kaydsan)" value={`$${savedIncome}`} sub={`Tx: $${totalIncome}`} accent="emerald" />
        <StatCard label="Kharashka (kaydsan)" value={`$${savedExpense}`} sub={`Tx: $${totalExpense}`} accent="rose" />
        <StatCard label="Balance" value={`$${savedSavings}`} sub={`Net: $${netBalance}`} accent="violet" />
        <StatCard label="Transactions" value={String(transactions.length)} sub="Wadarta guud" accent="pink" />
      </div>

      <form onSubmit={handleSaveTotals} className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Wadarta bisha — kaydi</h2>
        <p className="mt-1 text-sm text-slate-500">Qor wadartaada kadib taabo Save.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Total Income" value={editedIncome} onChange={setEditedIncome} />
          <Field label="Total Expense" value={editedExpense} onChange={setEditedExpense} />
          <Field label="Balance (Saved)" value={editedSavings} onChange={setEditedSavings} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-400 disabled:opacity-60"
        >
          {saving ? 'Kaydinaya...' : 'Save totals'}
        </button>
      </form>

      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Transactions ugu dambeeyay</h2>
          <Link to="/transactions" className="text-sm font-medium text-pink-600 hover:underline">
            Eeg dhammaan →
          </Link>
        </div>
        <div className="mt-5 space-y-3">
          {recent.length === 0 ? (
            <p className="py-8 text-center text-slate-400">Weli ma jiraan transactions.</p>
          ) : (
            recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-pink-50 bg-pink-50/50 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{t.description}</p>
                  <p className="text-xs text-slate-500">
                    {t.category} · {t.date}
                  </p>
                </div>
                <p className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-pink-600'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent: 'emerald' | 'rose' | 'violet' | 'pink'
}) {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    violet: 'from-violet-500 to-purple-500',
    pink: 'from-pink-500 to-rose-500',
  }
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[accent]} p-5 text-white shadow-lg`}>
      <p className="text-sm text-white/80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-white/70">{sub}</p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
      />
    </label>
  )
}
