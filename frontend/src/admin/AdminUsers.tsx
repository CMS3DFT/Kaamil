import { useCallback, useEffect, useState } from 'react'
import { api, type AdminUser } from '../api'

const emptyForm = {
  email: '',
  fullName: '',
  password: '',
  role: 'User',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await api.adminGetUsers())
    } catch {
      setError('Ma suurtogelin in la soo qaado users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.adminCreateUser(form)
      setShowCreate(false)
      setForm(emptyForm)
      setMessage('User cusub waa la abuuray.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay.')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setError('')
    try {
      await api.adminUpdateUser(editUser.id, {
        email: editUser.email,
        fullName: editUser.fullName,
        role: editUser.role,
        isActive: editUser.isActive,
      })
      setEditUser(null)
      setMessage('User waa la cusbooneysiiyay.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetId || !newPassword) return
    setError('')
    try {
      await api.adminResetPassword(resetId, newPassword)
      setResetId(null)
      setNewPassword('')
      setMessage('Password cusub waa la dejiyay.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Ma hubtaa inaad tirtirto user-kan?')) return
    setError('')
    try {
      await api.adminDeleteUser(id)
      setMessage('User waa la tirtiray.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khalad ayaa dhacay.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Users</h2>
          <p className="text-slate-500">Maamul dhammaan isticmaalayaasha</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 hover:bg-pink-400"
        >
          + User cusub
        </button>
      </div>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-pink-50 px-4 py-3 text-sm text-pink-700">{error}</p>}

      <div className="space-y-3 md:hidden">
        {loading ? (
          <p className="py-12 text-center text-slate-400">Loading...</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-slate-900">{u.fullName}</p>
              <p className="mt-1 truncate text-sm text-slate-600">{u.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.role === 'Admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {u.role}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditUser({ ...u })}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setResetId(u.id)}
                  className="rounded-lg border border-pink-200 px-3 py-1.5 text-xs text-pink-600 hover:bg-pink-50"
                >
                  Password
                </button>
                {u.role !== 'Admin' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Magac</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.fullName}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.role === 'Admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditUser({ ...u })}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetId(u.id)}
                        className="rounded-lg border border-pink-200 px-3 py-1.5 text-xs text-pink-600 hover:bg-pink-50"
                      >
                        Password
                      </button>
                      {u.role !== 'Admin' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal title="User cusub" onClose={() => setShowCreate(false)}>
          <form className="space-y-4" onSubmit={handleCreate}>
            <Input label="Magac" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            <label className="block text-sm text-slate-700">
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-xl bg-pink-500 py-3 font-semibold text-white">
              Abuur
            </button>
          </form>
        </Modal>
      )}

      {editUser && (
        <Modal title="Wax ka beddel user" onClose={() => setEditUser(null)}>
          <form className="space-y-4" onSubmit={handleUpdate}>
            <Input label="Magac" value={editUser.fullName} onChange={(v) => setEditUser({ ...editUser, fullName: v })} />
            <Input label="Email" type="email" value={editUser.email} onChange={(v) => setEditUser({ ...editUser, email: v })} />
            <label className="block text-sm text-slate-700">
              Role
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editUser.isActive}
                onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                className="h-4 w-4 accent-pink-500"
              />
              Active
            </label>
            <button type="submit" className="w-full rounded-xl bg-pink-500 py-3 font-semibold text-white">
              Kaydi
            </button>
          </form>
        </Modal>
      )}

      {resetId && (
        <Modal title="Password cusub" onClose={() => setResetId(null)}>
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <Input label="Password cusub" type="password" value={newPassword} onChange={setNewPassword} />
            <button type="submit" className="w-full rounded-xl bg-pink-500 py-3 font-semibold text-white">
              Beddel password
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-pink-400"
      />
    </label>
  )
}
