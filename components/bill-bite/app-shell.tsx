'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { LayoutDashboard, Plus, ReceiptText, Utensils, Wallet, ChartNoAxesCombined, Settings, LogOut, Menu as MenuIcon, Search, X, Minus, Trash2, Printer, Banknote, Smartphone, ChevronRight, Check, Download, Upload, Percent, Hash } from 'lucide-react'
import { billsSeed, billProfit, currentUser, dateLabel, expensesSeed, getStored, menuSeed, money, saveStored, nextBillNumber, getTaxRate, saveTaxRate, getBusinessProfile, saveBusinessProfile, exportAllData, importData, expenseCategories, type Bill, type BillItem, type BusinessProfile, type Category, type Expense, type ExpenseCategory, type MenuItem, type PaymentMethod, type Role } from '@/lib/bill-bite/data'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, owner: true },
  { href: '/new-bill', label: 'New Bill', icon: Plus },
  { href: '/sales', label: 'Sales History', icon: ReceiptText },
  { href: '/menu', label: 'Menu', icon: Utensils, owner: true },
  { href: '/expenses', label: 'Expenses', icon: Wallet, owner: true },
  { href: '/reports', label: 'Reports', icon: ChartNoAxesCombined, owner: true },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function getGreeting(name: string) {
  const h = new Date().getHours()
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${time}, ${name.split(' ')[0]}`
}

/* ── Toast Notification System ── */
type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 grid gap-2" style={{ maxWidth: '360px' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg animate-slide-up ${
            t.type === 'success'
              ? 'bg-primary text-primary-foreground'
              : t.type === 'error'
                ? 'bg-destructive text-white'
                : 'bg-card text-foreground border border-border'
          }`}
        >
          {t.type === 'success' && <Check size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function AppShell() {
  const [path, setPath] = useState('/')
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null)
  const [ready, setReady] = useState(false)
  const [menu, setMenu] = useState<MenuItem[]>(menuSeed)
  const [bills, setBills] = useState<Bill[]>(billsSeed)
  const [expenses, setExpenses] = useState<Expense[]>(expensesSeed)
  const [open, setOpen] = useState(false)
  const [greetingText, setGreetingText] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    setPath(window.location.pathname)
    // Check if a user session exists in localStorage
    const storedUser = getStored<{ name: string; role: Role } | null>('bb-user', null)
    if (storedUser) {
      setUser(storedUser)
      setGreetingText(getGreeting(storedUser.name))
    }
    // Load persisted data from localStorage (do NOT wipe it)
    setMenu(getStored<MenuItem[]>('bb-menu', menuSeed))
    setBills(getStored<Bill[]>('bb-bills', billsSeed))
    setExpenses(getStored<Expense[]>('bb-expenses', expensesSeed))
    setReady(true)
    const f = () => setPath(window.location.pathname)
    addEventListener('popstate', f)
    return () => removeEventListener('popstate', f)
  }, [])

  const go = (href: string) => { history.pushState({}, '', href); setPath(href); setOpen(false) }

  // Show nothing until we've checked localStorage for a saved session
  if (!ready) return null

  // No user logged in — show login screen
  if (!user) return (
    <Login onLogin={(u) => { setUser(u); saveStored('bb-user', u); setGreetingText(getGreeting(u.name)); go(u.role === 'staff' ? '/new-bill' : '/') }} />
  )

  if (user.role === 'staff' && ['/', '/menu', '/expenses', '/reports'].includes(path)) { go('/new-bill'); return null }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sidebar ── */}
      <aside className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 z-40 w-64 flex-col border-r border-border bg-card p-5 md:flex`}>
        <div className="flex items-center justify-between">
          <button onClick={() => go('/')} className="flex items-center gap-3 group">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Utensils size={18} />
            </span>
            <b className="font-serif text-xl tracking-tight">Bill Bite</b>
          </button>
          <button className="md:hidden" onClick={() => setOpen(false)}><X /></button>
        </div>

        <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[.2em] text-muted-foreground">Workspace</p>
        <nav className="mt-3 grid gap-1">
          {nav.filter(n => !n.owner || user.role === 'owner').map(n => (
            <button
              key={n.href}
              onClick={() => go(n.href)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${path === n.href
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <n.icon size={18} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-primary/10 border border-primary/20 p-4">
          <p className="text-sm font-bold">{user.role === 'owner' ? 'Owner workspace' : 'Cashier mode'}</p>
          <p className="mt-1 text-xs leading-5 opacity-75">Fast, focused tools for every service.</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <section className="md:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-5 md:px-9 sticky top-0 z-30">
          <button className="md:hidden" onClick={() => setOpen(true)}><MenuIcon /></button>
          <div className="hidden text-sm text-muted-foreground md:block">
            {user.role === 'owner' ? greetingText || '' : 'Ready for the next order'}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold uppercase border border-primary/20">
              {user.role}
            </span>
            <button
              onClick={() => go('/settings')}
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-5 md:p-9 animate-fade-in">
          {path === '/'
            ? <Dashboard bills={bills} expenses={expenses} onGo={go} />
            : path === '/new-bill'
              ? <NewBill menu={menu} onSave={(b) => { const next = [b, ...bills]; setBills(next); saveStored('bb-bills', next); toast(`Bill ${b.number} created`); go('/receipt/' + b.id) }} />
              : path === '/sales'
                ? <Sales bills={bills} onGo={go} onDelete={(id) => { const bill = bills.find(b => b.id === id); const next = bills.filter(b => b.id !== id); setBills(next); saveStored('bb-bills', next); toast(`Bill ${bill?.number || ''} deleted`) }} />
                : path.startsWith('/receipt/')
                  ? <Receipt bill={bills.find(b => b.id === path.split('/')[2]) || bills[0]} onGo={go} />
                  : path === '/menu'
                    ? <MenuPage menu={menu} setMenu={(m) => { setMenu(m); saveStored('bb-menu', m) }} toast={toast} />
                    : path === '/expenses'
                      ? <Expenses expenses={expenses} setExpenses={(e) => { setExpenses(e); saveStored('bb-expenses', e) }} toast={toast} />
                      : path === '/reports'
                        ? <Reports bills={bills} expenses={expenses} />
                        : <SettingsPage
                            user={user}
                            onLogout={() => { localStorage.removeItem('bb-user'); setUser(null); toast('Logged out successfully', 'info'); go('/') }}
                            toast={toast}
                            onImport={(data) => { setMenu(data.menu); setBills(data.bills); setExpenses(data.expenses) }}
                          />
          }
        </main>
      </section>

      {/* ── Toast Notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

/* ── Heading ── */
function Heading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[.2em] text-accent">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  )
}

/* ── KPI Card ── */
function Kpi({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md ${strong ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-4 font-serif font-bold tabular-nums ${strong ? 'text-4xl text-primary' : 'text-3xl'}`}>{value}</p>
    </div>
  )
}

/* ── Dashboard ── */
function Dashboard({ bills, expenses, onGo }: { bills: Bill[]; expenses: Expense[]; onGo: (p: string) => void }) {
  // FIX #15: Use actual today's date, not the first bill's date
  const todayKey = new Date().toISOString().slice(0, 10)
  const today = bills.filter(b => b.date.slice(0, 10) === todayKey)
  const sales = today.reduce((s, b) => s + b.total, 0)
  const costs = today.reduce((s, b) => s + b.items.reduce((x, i) => x + i.cost * i.quantity, 0), 0)

  return (
    <>
      <Heading
        eyebrow="Owner overview"
        title="Your kitchen, in numbers."
        action={
          <button
            onClick={() => onGo('/new-bill')}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            + New Bill
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Today's sales" value={money(sales)} strong />
        <Kpi label="Bills today" value={String(today.length)} />
        <Kpi label="Estimated gross profit" value={money(sales - costs)} />
        <Kpi label="Cash / UPI" value={`${money(bills.filter(b => b.payment === 'cash').reduce((s, b) => s + b.total, 0))} / ${money(bills.filter(b => b.payment === 'upi').slice(0, 7).reduce((s, b) => s + b.total, 0))}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Bar chart */}
        <section className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold">Last 7 days</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sales performance at a glance</p>
            </div>
            <button onClick={() => onGo('/reports')} className="text-sm font-bold text-accent hover:underline">View report</button>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3">
            {bills.length
              ? bills.slice(0, 7).reverse().map((b, i) => (
                <div key={b.id} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent transition-all hover:opacity-90"
                    style={{ height: `${35 + (b.total % 65)}%` }}
                  />
                  <span className="text-xs text-muted-foreground">Bill {i + 1}</span>
                </div>
              ))
              : <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Create bills to see sales performance.</div>
            }
          </div>
        </section>

        {/* Monthly summary */}
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-70">This month</p>
          <p className="mt-5 font-serif text-4xl font-bold">{money(bills.reduce((s, b) => s + b.total, 0))}</p>
          <p className="mt-2 text-sm opacity-70">total sales from {bills.length} bills</p>
          <div className="mt-8 border-t border-white/20 pt-5">
            <p className="text-sm font-semibold">{money(expenses.reduce((s, e) => s + e.amount, 0))} recorded expenses</p>
            <button onClick={() => onGo('/sales')} className="mt-5 flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
              Open sales history <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* Recent bills */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold">Recent bills</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest activity from your counter</p>
          </div>
          <button onClick={() => onGo('/sales')} className="text-sm font-bold text-accent hover:underline">View all</button>
        </div>
        <div className="mt-4 grid gap-2">
          {bills.slice(0, 5).map(b => (
            <button
              onClick={() => onGo('/receipt/' + b.id)}
              key={b.id}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-muted transition-colors group"
            >
              <span>
                <b className="font-mono text-sm">{b.number}</b>
                <span className="ml-3 text-sm text-muted-foreground">{dateLabel(b.date)}</span>
              </span>
              <span className="font-bold tabular-nums group-hover:text-primary transition-colors">{money(b.total)}</span>
            </button>
          ))}
          {!bills.length && (
            <div className="py-10 text-center text-sm text-muted-foreground">No bills yet. Create your first bill above.</div>
          )}
        </div>
      </section>
    </>
  )
}

/* ── New Bill ── */
function NewBill({ menu, onSave }: { menu: MenuItem[]; onSave: (b: Bill) => void }) {
  const [cart, setCart] = useState<BillItem[]>([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [saving, setSaving] = useState(false)
  // FIX #8: Discount input
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent')
  const [discountValue, setDiscountValue] = useState('')

  const visible = menu.filter(m => m.active && (cat === 'All' || m.category === cat) && m.name.toLowerCase().includes(search.toLowerCase()))
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  // FIX #7: Use configurable tax rate
  const taxRate = getTaxRate()
  const discountAmount = discountType === 'percent'
    ? Math.round(subtotal * (Number(discountValue) || 0) / 100)
    : Math.round(Number(discountValue) || 0)
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxAmount = Math.round(afterDiscount * taxRate / 100)
  const total = afterDiscount + taxAmount

  const add = (item: MenuItem) => setCart(c => {
    const found = c.find(i => i.id === item.id)
    return found ? c.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...c, { ...item, quantity: 1 }]
  })

  const save = () => {
    if (!cart.length) return
    setSaving(true)
    setTimeout(() => onSave({
      id: 'b' + Date.now(),
      // FIX #6: Sequential bill numbers instead of random
      number: nextBillNumber(),
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      payment,
      createdBy: 'Arjun Kapoor',
    }), 450)
  }

  return (
    <>
      <Heading eyebrow="Counter" title="Create a new bill" action={<span className="text-sm text-muted-foreground">Tap an item to add it</span>} />
      <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
        <section>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {(['All', 'Starters', 'Mains', 'Breads', 'Beverages'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${cat === c ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/70'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search menu"
              className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {visible.map(item => (
              <button
                key={item.id}
                onClick={() => add(item)}
                className="rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md active:scale-95"
              >
                <span className="text-xs text-muted-foreground">{item.category}</span>
                <b className="mt-2 block font-serif text-lg">{item.name}</b>
                <span className="mt-2 block font-bold tabular-nums text-primary">{money(item.price)}</span>
              </button>
            ))}
            {!visible.length && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                {menu.length === 0 ? 'No menu items yet. Add items in the Menu section first.' : 'No items match your search.'}
              </div>
            )}
          </div>
        </section>

        {/* Cart */}
        <section className="h-fit rounded-2xl border border-border bg-card p-5 shadow-lg lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">Current bill</h2>
              <p className="text-sm text-muted-foreground">{cart.length} items</p>
            </div>
            <button onClick={() => setCart([])} className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors">Clear</button>
          </div>
          <div className="mt-5 grid gap-2">
            {cart.map(i => (
              <div key={i.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                <div>
                  <b className="text-sm">{i.name}</b>
                  <p className="text-xs text-muted-foreground">{i.quantity} × {money(i.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCart(c => i.quantity === 1 ? c.filter(x => x.id !== i.id) : c.map(x => x.id === i.id ? { ...x, quantity: x.quantity - 1 } : x))}
                    className="grid size-7 place-items-center rounded-lg bg-card hover:bg-background transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{i.quantity}</span>
                  <button onClick={() => add(i)} className="grid size-7 place-items-center rounded-lg bg-card hover:bg-background transition-colors">+</button>
                </div>
              </div>
            ))}
          </div>
          {!cart.length && (
            <p className="py-10 text-center text-sm text-muted-foreground">Your bill is empty. Add dishes to begin.</p>
          )}

          {/* FIX #8: Discount input */}
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Discount</p>
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-input overflow-hidden">
                <button
                  onClick={() => setDiscountType('percent')}
                  className={`px-3 py-2 text-xs font-bold transition-colors ${discountType === 'percent' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                >
                  <Percent size={12} />
                </button>
                <button
                  onClick={() => setDiscountType('flat')}
                  className={`px-3 py-2 text-xs font-bold transition-colors ${discountType === 'flat' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                >
                  ₹
                </button>
              </div>
              <input
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? '0%' : '₹0'}
                type="number"
                min="0"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span><b className="text-foreground">{money(subtotal)}</b>
            </div>
            {discountAmount > 0 && (
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Discount</span><b className="text-accent">-{money(discountAmount)}</b>
              </div>
            )}
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>Tax ({taxRate}%)</span><b className="text-foreground">{money(taxAmount)}</b>
            </div>
            <div className="mt-4 flex justify-between">
              <b>Total</b>
              <strong className="font-serif text-3xl tabular-nums text-primary">{money(total)}</strong>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(['cash', 'upi'] as PaymentMethod[]).map(p => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold uppercase transition-all ${payment === p ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
              >
                {p === 'cash' ? <Banknote size={16} /> : <Smartphone size={16} />} {p}
              </button>
            ))}
          </div>
          <button
            disabled={!cart.length || saving}
            onClick={save}
            className="mt-4 w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
          >
            {saving ? 'Saving bill…' : 'Confirm & Generate Bill'}
          </button>
        </section>
      </div>
    </>
  )
}

/* ── Receipt ── */
function Receipt({ bill, onGo }: { bill: Bill; onGo: (p: string) => void }) {
  // FIX #13: Show business details on receipt
  const profile = getBusinessProfile()

  return (
    <div>
      <div className="mb-6 flex justify-between print:hidden">
        <button onClick={() => onGo('/new-bill')} className="font-bold text-accent hover:underline">← Back to billing</button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Printer size={16} /> Print receipt
        </button>
      </div>
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-6 font-mono text-sm shadow-xl">
        <div className="text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Utensils size={17} />
          </div>
          <h1 className="mt-3 font-serif text-2xl font-bold">{profile.restaurantName || 'Bill Bite'}</h1>
          {profile.address && <p className="mt-1 text-xs text-muted-foreground">{profile.address}</p>}
          {profile.phone && <p className="text-xs text-muted-foreground">Tel: {profile.phone}</p>}
          {profile.gstNumber && <p className="text-xs text-muted-foreground">GSTIN: {profile.gstNumber}</p>}
          {!profile.address && !profile.phone && !profile.gstNumber && (
            <p className="mt-1 text-xs text-muted-foreground">Fresh food. Clear bills.</p>
          )}
        </div>
        <div className="my-5 border-y border-dashed border-border py-3 text-xs">
          <div className="flex justify-between">
            <span>{bill.number}</span>
            <span>{dateLabel(bill.date)}</span>
          </div>
        </div>
        <div className="grid gap-3">
          {bill.items.map(i => (
            <div key={i.id} className="flex justify-between">
              <span>{i.name} × {i.quantity}</span>
              <b>{money(i.price * i.quantity)}</b>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-dashed border-border pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(bill.subtotal)}</span></div>
          {bill.discount > 0 && (
            <div className="mt-2 flex justify-between"><span>Discount</span><span>-{money(bill.discount)}</span></div>
          )}
          <div className="mt-2 flex justify-between"><span>Tax</span><span>{money(bill.tax)}</span></div>
          <div className="mt-3 flex justify-between text-lg font-bold text-primary"><span>Total</span><span>{money(bill.total)}</span></div>
          <p className="mt-3 text-xs uppercase text-muted-foreground">Paid via {bill.payment}</p>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">{profile.thankYouMessage || 'Thank you, see you again.'}</div>
      </div>
    </div>
  )
}

/* ── Sales ── */
type Period = 'today' | 'week' | 'month' | 'year' | 'all'

function Sales({ bills, onGo, onDelete }: { bills: Bill[]; onGo: (p: string) => void; onDelete: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [payment, setPayment] = useState('all')
  const [period, setPeriod] = useState<Period>('all')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const list = bills.filter(b => {
    // search filter
    if (!b.number.toLowerCase().includes(q.toLowerCase())) return false
    // payment filter
    if (payment !== 'all' && b.payment !== payment) return false
    // period filter
    if (period !== 'all') {
      const billDate = new Date(b.date)
      const now = new Date()
      if (period === 'today') {
        return billDate.toDateString() === now.toDateString()
      } else if (period === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        return billDate >= weekAgo
      } else if (period === 'month') {
        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear()
      } else if (period === 'year') {
        return billDate.getFullYear() === now.getFullYear()
      }
    }
    return true
  })

  const totalShown = list.reduce((s, b) => s + b.total, 0)

  return (
    <>
      <Heading
        eyebrow="Owner workspace"
        title="Sales history"
        action={
          <button onClick={() => onGo('/new-bill')} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            + New Bill
          </button>
        }
      />

      {/* ── Filters ── */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search bill number"
            className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={payment}
          onChange={e => setPayment(e.target.value)}
          className="rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All payments</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
        </select>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className="rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>

      {/* ── Summary strip ── */}
      {list.length > 0 && (
        <div className="mt-3 flex items-center gap-4 rounded-xl bg-primary/8 border border-primary/20 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">{list.length} bill{list.length !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-bold text-primary">{money(totalShown)} total</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1fr_1fr_100px_1fr_1fr_48px] gap-4 border-b border-border p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Bill</span>
          <span>Date</span>
          <span>Payment</span>
          <span>Est. profit</span>
          <span className="text-right">Total</span>
          <span />
        </div>

        {list.map(b => (
          <div
            key={b.id}
            className="flex items-center border-b border-border last:border-0 hover:bg-muted transition-colors"
          >
            {/* Clickable row — navigates to receipt */}
            <button
              onClick={() => { setConfirmId(null); onGo('/receipt/' + b.id) }}
              className="grid flex-1 grid-cols-2 gap-3 p-4 text-left md:grid-cols-[1fr_1fr_100px_1fr_1fr] md:items-center"
            >
              <b className="font-mono">{b.number}</b>
              <span className="text-sm text-muted-foreground">{dateLabel(b.date)}</span>
              <span className="text-xs font-bold uppercase text-primary">{b.payment}</span>
              <span className="text-sm tabular-nums">{money(billProfit(b))}</span>
              <strong className="text-right tabular-nums">{money(b.total)}</strong>
            </button>

            {/* Delete — 2-step inline confirmation */}
            <div className="flex flex-shrink-0 items-center gap-1 px-3">
              {confirmId === b.id ? (
                <>
                  <button
                    onClick={() => { onDelete(b.id); setConfirmId(null) }}
                    className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/70 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(b.id)}
                  aria-label={`Delete bill ${b.number}`}
                  className="grid size-8 place-items-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {!list.length && (
          <div className="p-12 text-center text-sm text-muted-foreground">No bills match these filters.</div>
        )}
      </div>
    </>
  )
}

/* ── Menu Page ── */
// FIX #10: Replace confirm() with inline confirmation for menu item deletion
function MenuPage({ menu, setMenu, toast }: { menu: MenuItem[]; setMenu: (m: MenuItem[]) => void; toast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Mains')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const add = () => {
    const selling = Number(price), purchase = Number(cost)
    if (!name.trim() || selling <= 0 || purchase < 0 || purchase >= selling) {
      setError('Enter a name, a selling price, and a cost lower than the selling price.')
      return
    }
    setMenu([...menu, { id: 'm' + Date.now(), name: name.trim(), category, price: selling, cost: purchase, active: true }])
    toast(`"${name.trim()}" added to menu`)
    setName(''); setPrice(''); setCost(''); setError('')
  }

  return (
    <>
      <Heading eyebrow="Owner workspace" title="Menu management" />
      <section className="mt-7 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl font-bold">Add a menu item</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name" className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <select value={category} onChange={e => setCategory(e.target.value as Category)} className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring">
            {(['Starters', 'Mains', 'Breads', 'Beverages'] as Category[]).map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Selling price" type="number" min="1" className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <input value={cost} onChange={e => setCost(e.target.value)} placeholder="Cost price" type="number" min="0" className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button onClick={add} className="mt-4 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground hover:opacity-90 transition-opacity active:scale-95">Add item</button>
      </section>

      <div className="mt-6 grid gap-3">
        {menu.map(i => (
          <div key={i.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-opacity ${!i.active ? 'opacity-50' : ''}`}>
            <div>
              <b className="font-serif text-lg">{i.name}</b>
              <p className="text-sm text-muted-foreground">{i.category} · cost {money(i.cost)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold tabular-nums">{money(i.price)}</span>
              <span className="hidden text-sm text-accent sm:block">{Math.round((1 - i.cost / i.price) * 100)}% margin</span>
              <button
                onClick={() => setMenu(menu.map(x => x.id === i.id ? { ...x, active: !x.active } : x))}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${i.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
              >
                {i.active ? 'Active' : 'Inactive'}
              </button>
              {/* FIX #10: Inline confirmation instead of window.confirm() */}
              {confirmDeleteId === i.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setMenu(menu.filter(x => x.id !== i.id)); setConfirmDeleteId(null); toast(`"${i.name}" removed from menu`) }}
                    className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/70 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(i.id)}
                  aria-label={`Delete ${i.name}`}
                  className="grid size-9 place-items-center rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {!menu.length && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No menu items yet. Add the dishes you sell above.
          </div>
        )}
      </div>
    </>
  )
}

/* ── Expenses ── */
// FIX #9: Add expense category dropdown
function Expenses({ expenses, setExpenses, toast }: { expenses: Expense[]; setExpenses: (e: Expense[]) => void; toast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Supplies')

  const add = () => {
    if (!description || !amount) return
    setExpenses([{ id: 'e' + Date.now(), date: new Date().toISOString(), category, description, amount: Number(amount) }, ...expenses])
    toast(`Expense "${description}" recorded`)
    setDescription(''); setAmount(''); setCategory('Supplies')
  }

  return (
    <>
      <Heading eyebrow="Owner workspace" title="Expenses" />
      <div className="mt-7 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl font-bold">Record an expense</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_140px_auto]">
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          {/* FIX #9: Category dropdown */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
            className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
          >
            {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={add} className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground hover:opacity-90 transition-opacity">Add expense</button>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {expenses.map(e => (
          <div key={e.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
            <div>
              <b>{e.description}</b>
              <p className="text-sm text-muted-foreground">{e.category} · {dateLabel(e.date)}</p>
            </div>
            <strong className="tabular-nums text-primary">{money(e.amount)}</strong>
          </div>
        ))}
        {!expenses.length && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No expenses recorded yet.
          </div>
        )}
      </div>
    </>
  )
}

/* ── Reports ── */
function Reports({ bills, expenses }: { bills: Bill[]; expenses: Expense[] }) {
  const sales = bills.reduce((s, b) => s + b.total, 0)
  const gross = bills.reduce((s, b) => s + billProfit(b), 0)
  const costs = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <>
      <Heading eyebrow="Owner workspace" title="Reports" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Total sales" value={money(sales)} strong />
        <Kpi label="Bills recorded" value={String(bills.length)} />
        <Kpi label="Estimated gross profit" value={money(gross)} />
        <Kpi label="Cash sales" value={money(bills.filter(b => b.payment === 'cash').reduce((s, b) => s + b.total, 0))} />
        <Kpi label="UPI sales" value={money(bills.filter(b => b.payment === 'upi').reduce((s, b) => s + b.total, 0))} />
        <Kpi label="Recorded expenses" value={money(costs)} />
      </div>
      <section className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-7">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Estimated net profit</p>
        <p className="mt-3 font-serif text-5xl font-bold tabular-nums text-primary">{money(gross - costs)}</p>
        <p className="mt-2 text-sm text-muted-foreground">Estimated gross profit minus recorded expenses</p>
      </section>
    </>
  )
}

/* ── Settings Page ── */
// FIX #4: Export/Import, #7: Tax rate config, #13: Business profile
function SettingsPage({ user, onLogout, toast, onImport }: {
  user: { name: string; role: Role }
  onLogout: () => void
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void
  onImport: (data: { menu: MenuItem[]; bills: Bill[]; expenses: Expense[] }) => void
}) {
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [taxRate, setTaxRate] = useState(() => getTaxRate())
  const [profile, setProfile] = useState<BusinessProfile>(() => getBusinessProfile())

  const handleExport = () => {
    exportAllData()
    toast('Backup exported successfully')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importData(file)
      onImport(data)
      toast('Data imported successfully — page will reload')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      toast((err as Error).message || 'Import failed', 'error')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveTaxRate = () => {
    const rate = Math.max(0, Math.min(100, taxRate))
    saveTaxRate(rate)
    setTaxRate(rate)
    toast(`Tax rate updated to ${rate}%`)
  }

  const handleSaveProfile = () => {
    saveBusinessProfile(profile)
    toast('Business profile saved')
  }

  return (
    <>
      <Heading eyebrow="Account" title="Settings" />

      {/* User Profile */}
      <section className="mt-8 max-w-xl rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{initials}</div>
          <div>
            <h2 className="font-serif text-2xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.role} account · Bill Bite</p>
          </div>
        </div>
        <div className="mt-7 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">Your workspace data is stored locally in this browser.</p>
          <button
            onClick={onLogout}
            className="mt-5 flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </section>

      {/* FIX #7: Tax Rate Configuration */}
      <section className="mt-6 max-w-xl rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold">Tax Rate (GST)</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configure the tax percentage applied to all bills.</p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={taxRate}
            onChange={e => setTaxRate(Number(e.target.value))}
            className="w-24 rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-center"
          />
          <span className="text-sm text-muted-foreground">%</span>
          <button
            onClick={handleSaveTaxRate}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Common: 5% (non-AC), 18% (AC restaurant), 12% (packaged food)</p>
      </section>

      {/* FIX #13: Business Profile */}
      <section className="mt-6 max-w-xl rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold">Business Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">This information is displayed on receipts.</p>
        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Restaurant Name</label>
            <input
              value={profile.restaurantName}
              onChange={e => setProfile(p => ({ ...p, restaurantName: e.target.value }))}
              placeholder="Bill Bite"
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</label>
            <input
              value={profile.address}
              onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
              placeholder="123 Main St, Mumbai"
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
              <input
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GSTIN</label>
              <input
                value={profile.gstNumber}
                onChange={e => setProfile(p => ({ ...p, gstNumber: e.target.value }))}
                placeholder="22AAAAA0000A1Z5"
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thank You Message</label>
            <input
              value={profile.thankYouMessage}
              onChange={e => setProfile(p => ({ ...p, thankYouMessage: e.target.value }))}
              placeholder="Thank you, see you again!"
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save Business Profile
        </button>
      </section>

      {/* FIX #4: Export / Import */}
      <section className="mt-6 max-w-xl rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold">Data Backup</h2>
        <p className="mt-1 text-sm text-muted-foreground">Export your data as a JSON backup or restore from a previous backup.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Download size={16} /> Export Backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-muted transition-colors"
          >
            <Upload size={16} /> Import Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">⚠️ Importing a backup will replace all current data.</p>
      </section>
    </>
  )
}

/* ── Login ── */
// FIX #3 (partial): Removed the plaintext password hint
function Login({ onLogin }: { onLogin: (u: { name: string; role: Role }) => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <form
        onSubmit={e => {
          e.preventDefault()
          const role = email.includes('staff') ? 'staff' : 'owner'
          if ((role === 'owner' && pass !== 'owner123') || (role === 'staff' && pass !== 'staff123')) {
            return setError('That password does not match the selected account.')
          }
          onLogin({ name: role === 'owner' ? 'Arjun Kapoor' : 'Neha Sharma', role })
        }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-xl"
      >
        <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Utensils />
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-accent">Welcome to</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Bill Bite</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Simple billing and clear numbers for your restaurant.</p>
        {error && <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <label className="mt-7 block text-sm font-semibold">
          Email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            type="email"
            placeholder="Enter your email"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <input
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
            type="password"
            placeholder="Enter your password"
          />
        </label>
        <button className="mt-6 w-full rounded-xl bg-primary py-3.5 font-bold text-primary-foreground hover:opacity-90 transition-all active:scale-95">
          Sign in
        </button>
      </form>
    </main>
  )
}
