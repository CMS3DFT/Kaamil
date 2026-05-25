import { useState } from 'react'
import { useUser } from '../UserContext'
import { api } from '../../api'

export default function UserTransactions() {
  const { transactions, setTransactions, loading } = useUser()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDesc, setEditingDesc] = useState('')
  const [editingAmount, setEditingAmount] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter)

  const startEdit = (id: string, desc: string, amount: number) => {
    setEditingId(id)
    setEditingDesc(desc)
    setEditingAmount(String(amount))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingDesc('')
    setEditingAmount('')
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    const value = Number(editingAmount)
    if (!editingDesc.trim() || Number.isNaN(value) || value < 0) return
    const updated = await api.updateTransaction(editingId, editingDesc.trim(), value)
    setTransactions((cur) => cur.map((t) => (t.id === editingId ? updated : t)))
    cancelEdit()
  }

  const remove = async (id: string) => {
    if (!confirm('Ma tirtirtaa transaction-kan?')) return
    await api.deleteTransaction(id)
    setTransactions((cur) => cur.filter((t) => t.id !== id))
    if (editingId === id) cancelEdit()
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500">Liiska dhammaan dakhliga iyo kharashaadka</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              filter === f ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 ring-1 ring-pink-100 hover:bg-pink-50'
            }`}
          >
            {f === 'all' ? 'Dhammaan' : f}
          </button>
        ))}
        <span className="ml-auto self-center rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
          {filtered.length} entries
        </span>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white py-16 text-center text-slate-400">
            Ma jiraan transactions noocaan ah.
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              {editingId === t.id ? (
                <form onSubmit={saveEdit} className="space-y-3">
                  <input
                    value={editingDesc}
                    onChange={(e) => setEditingDesc(e.target.value)}
                    className="w-full rounded-xl border border-pink-200 px-4 py-2.5"
                  />
                  <input
                    type="number"
                    value={editingAmount}
                    onChange={(e) => setEditingAmount(e.target.value)}
                    className="w-full rounded-xl border border-pink-200 px-4 py-2.5"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-xl bg-pink-500 px-4 py-2 text-sm text-white">
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit} className="rounded-xl bg-slate-100 px-4 py-2 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg ${
                        t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'
                      }`}
                    >
                      {t.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{t.description}</p>
                      <p className="text-sm text-slate-500">
                        {t.category} · {t.date}
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {t.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p
                      className={`text-xl font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-pink-600'}`}
                    >
                      {t.type === 'income' ? '+' : '-'}${t.amount}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(t.id, t.description, t.amount)}
                        className="rounded-lg border border-pink-200 px-3 py-1.5 text-xs text-pink-600 hover:bg-pink-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
    </div>
  )
}
