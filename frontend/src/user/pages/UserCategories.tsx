import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useUser } from '../UserContext'

export default function UserCategories() {
  const { transactions, categories, setCategories, setTransactions, loading } = useUser()
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0])
    }
  }, [categories, selectedCategory])

  const categoryTx = transactions.filter((t) => t.category === selectedCategory && t.type === 'expense')
  const categoryTotal = categoryTx.reduce((s, t) => s + t.amount, 0)

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCategory.trim()
    if (!name) return
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setNewCategory('')
      return
    }
    await api.createCategory(name)
    setCategories((c) => [name, ...c])
    setSelectedCategory(name)
    setNewCategory('')
    setMessage(`Qaybta "${name}" waa la daray.`)
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number(amount)
    if (!desc.trim() || Number.isNaN(value) || value <= 0) return
    const created = await api.createTransaction({
      description: desc.trim(),
      category: selectedCategory,
      amount: value,
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
    })
    setTransactions((c) => [created, ...c])
    setDesc('')
    setAmount('')
    setMessage('Waxaa lagu daray qaybtaan.')
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Qaybaha (Categories)</h1>
        <p className="text-slate-500">Maamul qaybaha iyo kharashaadka qayb kasta</p>
      </div>

      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Ku dar qayb cusub</h2>
          <form className="mt-4 flex gap-2" onSubmit={handleAddCategory}>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Magaca qaybta cusub"
              className="min-w-0 flex-1 rounded-xl border border-pink-200 px-4 py-3"
            />
            <button type="submit" className="rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-400">
              Abuur
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">{selectedCategory}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Wadarta kharashka: <span className="font-semibold text-pink-600">${categoryTotal}</span>
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleQuickAdd}>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Magaca waxa la isticmaalay"
              className="w-full rounded-xl border border-pink-200 px-4 py-3"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Lacagta"
              className="w-full rounded-xl border border-pink-200 px-4 py-3"
            />
            <button type="submit" className="w-full rounded-xl bg-pink-500 py-3 font-semibold text-white hover:bg-pink-400">
              Ku dar qaybtaan
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Liiska — {selectedCategory}</h2>
        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
          {categoryTx.length === 0 ? (
            <p className="py-8 text-center text-slate-400">Ma jiraan wax lagu qoray qaybtaan.</p>
          ) : (
            categoryTx.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl bg-pink-50/80 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{t.description}</p>
                  <p className="text-xs text-slate-500">{t.date}</p>
                </div>
                <p className="font-semibold text-pink-600">-${t.amount}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
