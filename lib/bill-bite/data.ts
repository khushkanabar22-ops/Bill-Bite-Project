export type Role = 'owner' | 'staff'
export type PaymentMethod = 'cash' | 'upi'
export type Category = 'Starters' | 'Mains' | 'Breads' | 'Beverages'
export type ExpenseCategory = 'Supplies' | 'Rent' | 'Salaries' | 'Utilities' | 'Maintenance' | 'Marketing' | 'Other'
export const expenseCategories: ExpenseCategory[] = ['Supplies', 'Rent', 'Salaries', 'Utilities', 'Maintenance', 'Marketing', 'Other']
export type MenuItem = { id: string; name: string; category: Category; price: number; cost: number; active: boolean }
export type BillItem = MenuItem & { quantity: number }
export type Bill = { id: string; number: string; date: string; items: BillItem[]; subtotal: number; discount: number; tax: number; total: number; payment: PaymentMethod; createdBy: string }
export type Expense = { id: string; date: string; category: string; description: string; amount: number }

export type BusinessProfile = {
  restaurantName: string
  address: string
  phone: string
  gstNumber: string
  thankYouMessage: string
}

export const defaultBusinessProfile: BusinessProfile = {
  restaurantName: 'Bill Bite',
  address: '',
  phone: '',
  gstNumber: '',
  thankYouMessage: 'Thank you, see you again!',
}

/* ── Seed data — gives the app a rich feel on first launch ── */
const _today = new Date()
const _day = (offset: number) => {
  const d = new Date(_today)
  d.setDate(d.getDate() - offset)
  return d.toISOString()
}

export const menuSeed: MenuItem[] = [
  { id: 'm1', name: 'Paneer Tikka', category: 'Starters', price: 280, cost: 100, active: true },
  { id: 'm2', name: 'Chicken 65', category: 'Starters', price: 320, cost: 120, active: true },
  { id: 'm3', name: 'Veg Spring Roll', category: 'Starters', price: 220, cost: 80, active: true },
  { id: 'm4', name: 'Butter Chicken', category: 'Mains', price: 380, cost: 140, active: true },
  { id: 'm5', name: 'Dal Makhani', category: 'Mains', price: 260, cost: 90, active: true },
  { id: 'm6', name: 'Palak Paneer', category: 'Mains', price: 280, cost: 100, active: true },
  { id: 'm7', name: 'Veg Biryani', category: 'Mains', price: 300, cost: 110, active: true },
  { id: 'm8', name: 'Butter Naan', category: 'Breads', price: 60, cost: 15, active: true },
  { id: 'm9', name: 'Garlic Naan', category: 'Breads', price: 70, cost: 18, active: true },
  { id: 'm10', name: 'Tandoori Roti', category: 'Breads', price: 40, cost: 10, active: true },
  { id: 'm11', name: 'Masala Chai', category: 'Beverages', price: 50, cost: 12, active: true },
  { id: 'm12', name: 'Fresh Lime Soda', category: 'Beverages', price: 80, cost: 20, active: true },
]

const _m = (id: string) => menuSeed.find(m => m.id === id)!

export const billsSeed: Bill[] = [
  { id: 'b1', number: 'BB-0001', date: _day(0), items: [{ ..._m('m4'), quantity: 2 }, { ..._m('m8'), quantity: 4 }, { ..._m('m11'), quantity: 2 }], subtotal: 1100, discount: 0, tax: 55, total: 1155, payment: 'upi', createdBy: 'Arjun Kapoor' },
  { id: 'b2', number: 'BB-0002', date: _day(0), items: [{ ..._m('m1'), quantity: 1 }, { ..._m('m5'), quantity: 1 }, { ..._m('m9'), quantity: 2 }], subtotal: 680, discount: 30, tax: 33, total: 683, payment: 'cash', createdBy: 'Neha Sharma' },
  { id: 'b3', number: 'BB-0003', date: _day(1), items: [{ ..._m('m2'), quantity: 2 }, { ..._m('m6'), quantity: 1 }, { ..._m('m8'), quantity: 3 }], subtotal: 1100, discount: 0, tax: 55, total: 1155, payment: 'cash', createdBy: 'Arjun Kapoor' },
  { id: 'b4', number: 'BB-0004', date: _day(1), items: [{ ..._m('m7'), quantity: 1 }, { ..._m('m12'), quantity: 2 }, { ..._m('m10'), quantity: 2 }], subtotal: 540, discount: 40, tax: 25, total: 525, payment: 'upi', createdBy: 'Neha Sharma' },
  { id: 'b5', number: 'BB-0005', date: _day(2), items: [{ ..._m('m4'), quantity: 3 }, { ..._m('m9'), quantity: 3 }, { ..._m('m11'), quantity: 3 }], subtotal: 1500, discount: 50, tax: 73, total: 1523, payment: 'cash', createdBy: 'Arjun Kapoor' },
  { id: 'b6', number: 'BB-0006', date: _day(3), items: [{ ..._m('m1'), quantity: 2 }, { ..._m('m5'), quantity: 2 }, { ..._m('m8'), quantity: 4 }], subtotal: 1320, discount: 0, tax: 66, total: 1386, payment: 'upi', createdBy: 'Arjun Kapoor' },
  { id: 'b7', number: 'BB-0007', date: _day(5), items: [{ ..._m('m3'), quantity: 2 }, { ..._m('m6'), quantity: 1 }, { ..._m('m12'), quantity: 2 }], subtotal: 880, discount: 0, tax: 44, total: 924, payment: 'cash', createdBy: 'Neha Sharma' },
  { id: 'b8', number: 'BB-0008', date: _day(6), items: [{ ..._m('m2'), quantity: 1 }, { ..._m('m7'), quantity: 2 }, { ..._m('m10'), quantity: 3 }], subtotal: 1040, discount: 0, tax: 52, total: 1092, payment: 'cash', createdBy: 'Arjun Kapoor' },
]

export const expensesSeed: Expense[] = [
  { id: 'e1', date: _day(0), category: 'Supplies', description: 'Vegetables from Mandi', amount: 3200 },
  { id: 'e2', date: _day(1), category: 'Utilities', description: 'Electricity bill', amount: 4500 },
  { id: 'e3', date: _day(3), category: 'Salaries', description: 'Kitchen helper weekly', amount: 5000 },
  { id: 'e4', date: _day(5), category: 'Maintenance', description: 'AC service', amount: 1500 },
]
export const money = (n:number) => `₹${Math.round(n).toLocaleString('en-IN')}`
export const dateLabel = (d:string) => { const date = new Date(d); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return String(date.getUTCDate()).padStart(2,'0') + ' ' + months[date.getUTCMonth()] + ' ' + date.getUTCFullYear() }
export const billProfit = (b:Bill) => b.items.reduce((s,x)=>s+(x.price-x.cost)*x.quantity,0)-b.discount
export const getStored = <T,>(key:string, fallback:T):T => { if(typeof window==='undefined') return fallback; try { const value=localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback } }
export const saveStored = (key:string, value:unknown) => { if(typeof window!=='undefined') localStorage.setItem(key,JSON.stringify(value)) }
export const currentUser = () => getStored<{name:string;role:Role}|null>('bb-user',null)

/* Sequential bill counter — avoids birthday-paradox collisions */
export function nextBillNumber(): string {
  const counter = getStored<number>('bb-bill-counter', 1)
  saveStored('bb-bill-counter', counter + 1)
  return `BB-${String(counter).padStart(4, '0')}`
}

/* Tax rate — configurable, default 5% */
export function getTaxRate(): number {
  return getStored<number>('bb-tax-rate', 5)
}
export function saveTaxRate(rate: number) {
  saveStored('bb-tax-rate', rate)
}

/* Business profile */
export function getBusinessProfile(): BusinessProfile {
  return getStored<BusinessProfile>('bb-business-profile', defaultBusinessProfile)
}
export function saveBusinessProfile(profile: BusinessProfile) {
  saveStored('bb-business-profile', profile)
}

/* Export / Import */
export function exportAllData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    menu: getStored('bb-menu', []),
    bills: getStored('bb-bills', []),
    expenses: getStored('bb-expenses', []),
    billCounter: getStored('bb-bill-counter', 1),
    taxRate: getStored('bb-tax-rate', 5),
    businessProfile: getBusinessProfile(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `billbite-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file: File): Promise<{ menu: MenuItem[]; bills: Bill[]; expenses: Expense[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!data.menu || !data.bills || !data.expenses) {
          reject(new Error('Invalid backup file format'))
          return
        }
        // Restore all data to localStorage
        saveStored('bb-menu', data.menu)
        saveStored('bb-bills', data.bills)
        saveStored('bb-expenses', data.expenses)
        if (data.billCounter) saveStored('bb-bill-counter', data.billCounter)
        if (data.taxRate) saveStored('bb-tax-rate', data.taxRate)
        if (data.businessProfile) saveStored('bb-business-profile', data.businessProfile)
        resolve({ menu: data.menu, bills: data.bills, expenses: data.expenses })
      } catch {
        reject(new Error('Failed to parse backup file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
