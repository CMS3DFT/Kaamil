import { useEffect, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export type NavItem = {
  to: string
  label: string
  end?: boolean
  icon: string
}

type Props = {
  variant: 'user' | 'admin'
  nav: NavItem[]
  brandTitle: string
  brandSubtitle: string
  headerTitle: string
  headerSubtitle: string
  userName: string
  userEmail: string
  onLogout: () => void
  children: ReactNode
  showBottomNav?: boolean
}

const styles = {
  user: {
    shell: 'min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50',
    sidebar: 'border-r border-pink-100 bg-white text-slate-900 shadow-xl shadow-pink-100/40',
    brand: 'from-pink-500 to-rose-500 shadow-lg shadow-pink-300/50',
    userBox: 'rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 text-slate-900',
    logout: 'border border-pink-200 text-pink-600 hover:bg-pink-50',
    header: 'border-pink-100/80 bg-white/80',
    menuBtn: 'border-pink-100 text-slate-700',
    bottomNav: 'border-pink-100 bg-white/95',
    navActive: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-300/40',
    navIdle: 'text-slate-600 hover:bg-pink-50 hover:text-pink-700',
    bottomActive: 'text-pink-600',
    bottomIdle: 'text-slate-500',
  },
  admin: {
    shell: 'min-h-screen bg-slate-100',
    sidebar: 'bg-slate-950 text-white shadow-2xl',
    brand: 'bg-pink-500',
    userBox: 'rounded-xl bg-white/5 text-white',
    logout: 'border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white',
    header: 'border-slate-200 bg-white shadow-sm',
    menuBtn: 'border-slate-200 text-slate-700',
    bottomNav: 'border-slate-200 bg-white/95',
    navActive: 'bg-pink-500 text-white shadow-lg shadow-pink-500/25',
    navIdle: 'text-slate-400 hover:bg-white/5 hover:text-white',
    bottomActive: 'text-pink-600',
    bottomIdle: 'text-slate-500',
  },
}

export default function MobileNavShell({
  variant,
  nav,
  brandTitle,
  brandSubtitle,
  headerTitle,
  headerSubtitle,
  userName,
  userEmail,
  onLogout,
  children,
  showBottomNav = variant === 'user',
}: Props) {
  const s = styles[variant]
  const inputId = `mobile-nav-${variant}`

  const closeMenu = () => {
    const el = document.getElementById(inputId) as HTMLInputElement | null
    if (el) el.checked = false
  }

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) closeMenu()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [inputId])

  return (
    <div className={s.shell}>
      <input id={inputId} type="checkbox" className="peer sr-only" />

      <label
        htmlFor={inputId}
        className="fixed inset-0 z-40 bg-slate-900/50 opacity-0 pointer-events-none transition peer-checked:opacity-100 peer-checked:pointer-events-auto lg:hidden"
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] max-w-[85vw] -translate-x-full flex-col transition-transform duration-200 peer-checked:translate-x-0 lg:translate-x-0 lg:w-64 xl:w-72 ${s.sidebar}`}
      >
        <div className="flex items-center justify-between border-b border-inherit px-4 py-5 lg:px-6 lg:py-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white lg:h-11 lg:w-11 lg:rounded-2xl ${s.brand}`}
            >
              K
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{brandTitle}</p>
              <p className="truncate text-xs opacity-70">{brandSubtitle}</p>
            </div>
          </div>
          <label
            htmlFor={inputId}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-xl opacity-70 hover:opacity-100 lg:hidden"
            aria-label="Xir menu"
          >
            ✕
          </label>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 lg:space-y-1.5 lg:px-4 lg:py-6">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition lg:rounded-2xl lg:py-3.5 ${
                  isActive ? s.navActive : s.navIdle
                }`
              }
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-inherit p-4">
          <div className={`px-4 py-3 ${s.userBox}`}>
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="truncate text-xs opacity-70">{userEmail}</p>
          </div>
          <button type="button" onClick={() => { closeMenu(); onLogout() }} className={`mt-3 w-full rounded-xl py-2.5 text-sm font-medium transition ${s.logout}`}>
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:ml-64 xl:ml-72">
        <header className={`sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md lg:px-8 lg:py-5 ${s.header}`}>
          <label
            htmlFor={inputId}
            className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-sm lg:hidden ${s.menuBtn}`}
            aria-label="Fur menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900 lg:text-base">{headerTitle}</p>
            <p className="truncate text-xs text-slate-500">{headerSubtitle}</p>
          </div>
        </header>

        <main className={`flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 ${showBottomNav ? 'pb-24' : 'pb-8'}`}>
          {children}
        </main>

        {showBottomNav && (
          <nav className={`fixed bottom-0 left-0 right-0 z-30 border-t px-1 py-1 backdrop-blur-md safe-bottom lg:hidden ${s.bottomNav}`}>
            <div className="mx-auto flex max-w-lg justify-around">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium sm:text-xs ${
                      isActive ? s.bottomActive : s.bottomIdle
                    }`
                  }
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="max-w-full truncate text-center leading-tight">{shortLabel(item.label)}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}

function shortLabel(label: string) {
  if (label === 'Transactions') return 'Tx'
  if (label === 'U dir Admin') return 'Report'
  if (label === 'Warbixinnada') return 'Reports'
  if (label.length > 10) return label.slice(0, 9) + '…'
  return label
}
