import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, type Transaction } from '../api'
import { clearSession } from '../auth'

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other']

export type UserContextValue = {
  transactions: Transaction[]
  categories: string[]
  savedIncome: number
  savedExpense: number
  savedSavings: number
  totalIncome: number
  totalExpense: number
  loading: boolean
  refresh: () => Promise<void>
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  setCategories: React.Dispatch<React.SetStateAction<string[]>>
  updateTotals: (income: number, expense: number, savings: number) => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [savedIncome, setSavedIncome] = useState(0)
  const [savedExpense, setSavedExpense] = useState(0)
  const [savedSavings, setSavedSavings] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions],
  )

  const refresh = useCallback(async () => {
    const [tx, cats, totals] = await Promise.all([
      api.getTransactions(),
      api.getCategories(),
      api.getTotals(),
    ])
    setTransactions(tx)
    const names = cats.map((c) => c.name)
    setCategories(names.length > 0 ? names : DEFAULT_CATEGORIES)
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

  const updateTotals = async (income: number, expense: number, savings: number) => {
    const totals = await api.updateTotals(income, expense, savings)
    setSavedIncome(totals.savedIncome)
    setSavedExpense(totals.savedExpense)
    setSavedSavings(totals.savedSavings)
  }

  return (
    <UserContext.Provider
      value={{
        transactions,
        categories,
        savedIncome,
        savedExpense,
        savedSavings,
        totalIncome,
        totalExpense,
        loading,
        refresh,
        setTransactions,
        setCategories,
        updateTotals,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
