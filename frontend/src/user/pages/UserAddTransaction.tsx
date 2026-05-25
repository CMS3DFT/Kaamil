import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useUser } from '../UserContext'

export default function UserAddTransaction() {
  const navigate = useNavigate()
  const { categories, setTransactions, setCategories } = useUser()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0])
    }
  }, [categories, category])

  const handleAddCategory = async () => {
    const name = newCategory.trim()
    if (!name) return
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setNewCategory('')
      return
    }
    await api.createCategory(name)
    setCategories((c) => [name, ...c])
    setCategory(name)
    setNewCategory('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const value = Number(amount)
    if (!description.trim() || !category || Number.isNaN(value) || value <= 0) {
      setError('Fadlan buuxi dhammaan meelaha si sax ah.')
      return
    }
    setLoading(true)
    try {
      const created = await api.createTransaction({
        description: description.trim(),
        category,
        amount: value,
        date,
        type,
      })
      setTransactions((c) => [created, ...c])
      navigate('/transactions')
    } catch {
      setError('Khalad ayaa dhacay. Isku day mar kale.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ku dar transaction</h1>
        <p className="text-slate-500">Geli dakhliga ama kharashka cusub</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-pink-100 bg-white p-8 shadow-lg shadow-pink-100/30"
      >
        {error && <p className="rounded-xl bg-pink-50 px-4 py-3 text-sm text-pink-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              type === 'expense' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-pink-200'
            }`}
          >
            <span className="text-2xl">↓</span>
            <p className="mt-2 font-semibold text-slate-900">Expense</p>
            <p className="text-xs text-slate-500">Kharash / bixitaan</p>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              type === 'income' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'
            }`}
          >
            <span className="text-2xl">↑</span>
            <p className="mt-2 font-semibold text-slate-900">Income</p>
            <p className="text-xs text-slate-500">Dakhlig / mushahar</p>
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Magaca / sharaxaadda
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tusaale: Mushahar, Kirada, Cunto"
            className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Lacagta ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Qaybta
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Taariikhda
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400"
          />
        </label>

        <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/50 p-4">
          <p className="text-sm font-medium text-slate-800">Ku dar qayb cusub</p>
          <div className="mt-3 flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Magaca qaybta"
              className="min-w-0 flex-1 rounded-xl border border-pink-200 bg-white px-4 py-2.5"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-pink-600 ring-1 ring-pink-200 hover:bg-pink-50"
            >
              Ku dar
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-4 text-base font-semibold text-white shadow-lg shadow-pink-300/40 hover:from-pink-400 hover:to-rose-400 disabled:opacity-60"
        >
          {loading ? 'Kaydinaya...' : 'Ku dar transaction'}
        </button>
      </form>
    </div>
  )
}
