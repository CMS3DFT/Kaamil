import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Transaction } from '../api'
import { clearSession } from '../auth'

const defaultCategories = ['Food', 'Transport', 'Bills', 'Shopping', 'Other']

type UserDataContextValue = {
  loading: boolean
  transactions: Transaction[]
  categories: string[]
  savedIncome: number
  savedExpense: number
  savedSavings: number
  totalIncome: number
  totalExpense: number
  refresh: () => Promise<void>
  updateTotals: (income: number, expense: number, savings: number) => Promise<void>
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, description: string, amount: number) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
}

const UserDataContext = createContext<UserDataContextValue | null>(null)

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [savedIncome, setSavedIncome] = useState(0)
  const [savedExpense, setSavedExpense] = useState(0)
  const [savedSavings, setSavedSavings] = useState(0)

  const refresh = useCallback(async () => {
    const [tx, cats, totals] = await Promise.all([
      api.getTransactions(),
      api.getCategories(),
      api.getTotals(),
    ])
    setTransactions(tx)
    const names = cats.map((c) => c.name)
    setCategories(names.length > 0 ? names : defaultCategories)
    setSavedIncome(totals.savedIncome)
    setSavedExpense(totals.savedExpense)
    setSavedSavings(totals.savedSavings)
  }, [])

  useEffect(() => {
    refresh()
      .catch(() => {
        clearSession()
        navigate('/login', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [refresh, navigate])

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )

  const value: UserDataContextValue = {
    loading,
    transactions,
    categories,
    savedIncome,
    savedExpense,
    savedSavings,
    totalIncome,
    totalExpense,
    refresh,
    updateTotals: async (income, expense, savings) => {
      const totals = await api.updateTotals(income, expense, savings)
      setSavedIncome(totals.savedIncome)
      setSavedExpense(totals.savedExpense)
      setSavedSavings(totals.savedSavings)
    },
    addTransaction: async (data) => {
      const created = await api.createTransaction(data)
      setTransactions((c) => [created, ...c])
    },
    updateTransaction: async (id, description, amount) => {
      const updated = await api.updateTransaction(id, description, amount)
      setTransactions((c) => c.map((t) => (t.id === id ? updated : t)))
    },
    deleteTransaction: async (id) => {
      await api.deleteTransaction(id)
      setTransactions((c) => c.filter((t) => t.id !== id))
    },
    addCategory: async (name) => {
      await api.createCategory(name)
      setCategories((c) => [name, ...c])
    },
  }

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
}

export function useUserData() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider')
  return ctx
}
