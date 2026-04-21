/**
 * PocketBase SDK client replacing the FastAPI API client.
 *
 * All functions return data mapped to the field names expected by existing
 * page components (the "old" naming convention). The PocketBase SDK is used
 * for all data operations.
 */

import pb from '@/lib/pocketbase'
import type {
  UnitRecord,
  TenantRecord,
  LeaseRecord,
  PaymentRecord,
  ExpenseRecord,
  MaintenanceRecord,
} from '@/types/pocketbase'

// Typed helpers
async function getUnitsRaw(): Promise<UnitRecord[]> {
  return pb.collection('units').getFullList<UnitRecord>()
}
async function getTenantsRaw(): Promise<TenantRecord[]> {
  return pb.collection('tenants').getFullList<TenantRecord>()
}
async function getLeasesRaw(): Promise<LeaseRecord[]> {
  return pb.collection('leases').getFullList<LeaseRecord>()
}
async function getPaymentsRaw(): Promise<PaymentRecord[]> {
  return pb.collection('payments').getFullList<PaymentRecord>()
}
async function getExpensesRaw(): Promise<ExpenseRecord[]> {
  return pb.collection('expenses').getFullList<ExpenseRecord>()
}
async function getMaintenanceRaw(): Promise<MaintenanceRecord[]> {
  return pb.collection('maintenance').getFullList<MaintenanceRecord>()
}

// =====================
// Helpers
// =====================

function getStatusMap(status: string): string {
  // PocketBase stores lowercase status values — map to the OLD uppercase convention
  const lower = status.toLowerCase()
  if (lower === 'occupied' || lower === 'active') return 'OCCUPIED'
  if (lower === 'vacant') return 'VACANT'
  if (lower === 'maintenance' || lower === 'open') return 'MAINTENANCE'
  if (lower === 'under_renovation' || lower === 'underrenovation') return 'UNDER_RENOVATION'
  if (lower === 'expired' || lower === 'terminated') return 'EXPIRED'
  if (lower === 'pending') return 'PENDING'
  if (lower === 'paid' || lower === 'completed') return 'PAID'
  if (lower === 'overdue') return 'OVERDUE'
  if (lower === 'in_progress') return 'IN_PROGRESS'
  if (lower === 'rejected' || lower === 'cancelled') return 'CANCELLED'
  return status
}

// =====================
// Units
// =====================

export interface Unit {
  id: string
  unit_number: string
  type: string
  status: string
  rent_amount: number
  security_deposit: number
  created_at: string
}

export interface UnitWithRelations extends Unit {
  current_tenant: { id: string; first_name: string; last_name: string; email: string } | null
  active_lease: { id: string; start_date: string; end_date: string; rent_amount: number; status: string } | null
}

export async function getUnits(q?: string): Promise<UnitWithRelations[]> {
  const records = await getUnitsRaw()

  const units: UnitWithRelations[] = records.map((u) => {
    return {
      id: u.id,
      unit_number: u.number,
      type: u.type || '',
      status: getStatusMap(u.status || 'vacant'),
      rent_amount: u.rent || 0,
      security_deposit: u.deposit || 0,
      created_at: u.createdAt,
      current_tenant: null,
      active_lease: null,
    }
  })

  // Client-side search filter
  if (q) {
    const qLower = q.toLowerCase()
    return units.filter(
      (u) =>
        u.unit_number.toLowerCase().includes(qLower) ||
        u.type.toLowerCase().includes(qLower)
    )
  }

  return units
}

export async function getUnit(id: string): Promise<UnitWithRelations> {
  const records = await getUnitsRaw()
  const u = records.find((r) => r.id === id)
  if (!u) throw new Error('Unit not found')
  return mapUnit(u)
}

function mapUnit(u: UnitRecord): UnitWithRelations {
  return {
    id: u.id,
    unit_number: u.number,
    type: u.type || '',
    status: getStatusMap(u.status || 'vacant'),
    rent_amount: u.rent || 0,
    security_deposit: u.deposit || 0,
    created_at: u.createdAt,
    current_tenant: null,
    active_lease: null,
  }
}

export interface CreateUnitData {
  unit_number: string
  type: string
  rent_amount: number
  security_deposit: number
}

export async function createUnit(data: CreateUnitData): Promise<Unit> {
  const u = await pb.collection('units').create({
    number: data.unit_number,
    type: data.type,
    rent: data.rent_amount,
    deposit: data.security_deposit,
    status: 'vacant',
    features: '',
    description: '',
  }) as unknown as UnitRecord
  return mapUnit(u)
}

export interface UpdateUnitData {
  type?: string
  status?: string
  rent_amount?: number
  security_deposit?: number
}

export async function updateUnit(id: string, data: UpdateUnitData): Promise<Unit> {
  const u = await pb.collection('units').update(id, {
    ...(data.type && { type: data.type }),
    ...(data.status && { status: data.status.toLowerCase() }),
    ...(data.rent_amount !== undefined && { rent: data.rent_amount }),
    ...(data.security_deposit !== undefined && { deposit: data.security_deposit }),
  }) as unknown as UnitRecord
  return mapUnit(u)
}

export async function deleteUnit(id: string): Promise<void> {
  await pb.collection('units').delete(id)
}

// =====================
// Tenants
// =====================

export interface Tenant {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  emergency_contact: string | null
  unit_id: string | null
  created_at: string
}

export interface TenantWithRelations extends Tenant {
  unit: { id: string; unit_number: string; type: string } | null
  active_lease: { id: string; start_date: string; end_date: string; rent_amount: number; status: string } | null
}

export async function getTenants(q?: string): Promise<TenantWithRelations[]> {
  const records = await getTenantsRaw()

  let tenants: TenantWithRelations[] = records.map((t) => ({
    id: t.id,
    first_name: t.firstName || '',
    last_name: t.lastName || '',
    email: t.email || '',
    phone: t.phone || null,
    emergency_contact: t.notes || null,
    unit_id: t.unit || null,
    created_at: t.createdAt,
    unit: null,
    active_lease: null,
  }))

  // Client-side search
  if (q) {
    const qLower = q.toLowerCase()
    tenants = tenants.filter(
      (t) =>
        t.first_name.toLowerCase().includes(qLower) ||
        t.last_name.toLowerCase().includes(qLower) ||
        t.email.toLowerCase().includes(qLower)
    )
  }

  return tenants
}

export async function getTenant(id: string): Promise<TenantWithRelations> {
  const records = await getTenantsRaw()
  const t = records.find((r) => r.id === id)
  if (!t) throw new Error('Tenant not found')
  return mapTenant(t)
}

function mapTenant(t: TenantRecord): TenantWithRelations {
  return {
    id: t.id,
    first_name: t.firstName || '',
    last_name: t.lastName || '',
    email: t.email || '',
    phone: t.phone || null,
    emergency_contact: t.notes || null,
    unit_id: t.unit || null,
    created_at: t.createdAt,
    unit: null,
    active_lease: null,
  }
}

export interface CreateTenantData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  emergency_contact?: string
  unit_id?: string
}

export async function createTenant(data: CreateTenantData): Promise<Tenant> {
  const t = await pb.collection('tenants').create({
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone || '',
    unit: data.unit_id || '',
    moveInDate: new Date().toISOString().split('T')[0],
    moveOutDate: null,
    status: 'active',
    notes: data.emergency_contact || '',
  }) as unknown as TenantRecord
  return mapTenant(t)
}

export interface UpdateTenantData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  emergency_contact?: string
  unit_id?: string
}

export async function updateTenant(id: string, data: UpdateTenantData): Promise<Tenant> {
  const t = await pb.collection('tenants').update(id, {
    ...(data.first_name && { firstName: data.first_name }),
    ...(data.last_name && { lastName: data.last_name }),
    ...(data.email && { email: data.email }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.emergency_contact !== undefined && { notes: data.emergency_contact }),
    ...(data.unit_id !== undefined && { unit: data.unit_id }),
  }) as unknown as TenantRecord
  return mapTenant(t)
}

export async function deleteTenant(id: string): Promise<void> {
  await pb.collection('tenants').delete(id)
}

// =====================
// Leases
// =====================

export interface Lease {
  id: string
  start_date: string
  end_date: string
  rent_amount: number
  status: string
  tenant_id: string
  unit_id: string
  documents: string[]
  created_at: string
}

export interface LeaseWithRelations extends Lease {
  tenant: { id: string; first_name: string; last_name: string; email: string } | null
  unit: { id: string; unit_number: string; type: string } | null
  payments: { id: string; amount: number; status: string }[]
}

export async function getLeases(status?: string): Promise<LeaseWithRelations[]> {
  const records = await pb.collection('leases').getFullList() as unknown as LeaseRecord[]

  let leases: LeaseWithRelations[] = records.map((l) => ({
    id: l.id,
    start_date: l.startDate,
    end_date: l.endDate,
    rent_amount: l.monthlyRent || 0,
    status: getStatusMap(l.status || 'active'),
    tenant_id: l.tenant || '',
    unit_id: l.unit || '',
    documents: [],
    created_at: l.createdAt,
    tenant: null,
    unit: null,
    payments: [],
  }))

  // Client-side status filter (map PocketBase status to old convention)
  if (status) {
    const pbStatus = status.toLowerCase()
    leases = leases.filter((l) => l.status === status)
  }

  return leases
}

export async function getLease(id: string): Promise<LeaseWithRelations> {
  const records = await getLeasesRaw()
  const l = records.find((r) => r.id === id)
  if (!l) throw new Error('Lease not found')
  return mapLease(l)
}

function mapLease(l: LeaseRecord): LeaseWithRelations {
  return {
    id: l.id,
    start_date: l.startDate,
    end_date: l.endDate,
    rent_amount: l.monthlyRent || 0,
    status: getStatusMap(l.status || 'active'),
    tenant_id: l.tenant || '',
    unit_id: l.unit || '',
    documents: [],
    created_at: l.createdAt,
    tenant: null,
    unit: null,
    payments: [],
  }
}

export interface CreateLeaseData {
  start_date: string
  end_date: string
  rent_amount: number
  tenant_id: string
  unit_id: string
  documents?: string[]
}

export async function createLease(data: CreateLeaseData, files?: File[]): Promise<Lease> {
  const payload: Record<string, unknown> = {
    unit: data.unit_id,
    tenant: data.tenant_id,
    startDate: data.start_date,
    endDate: data.end_date,
    monthlyRent: data.rent_amount,
    depositAmount: 0,
    status: 'active',
    tenantAccess: '',
  }
  if (files && files.length > 0) {
    payload['tenantAccess'] = files // PocketBase file upload
  }
  const l = await pb.collection('leases').create(payload) as unknown as LeaseRecord
  return mapLease(l)
}

export interface UpdateLeaseData {
  start_date?: string
  end_date?: string
  rent_amount?: number
  status?: string
}

export async function updateLease(id: string, data: UpdateLeaseData): Promise<Lease> {
  const l = await pb.collection('leases').update(id, {
    ...(data.start_date && { startDate: data.start_date }),
    ...(data.end_date && { endDate: data.end_date }),
    ...(data.rent_amount !== undefined && { monthlyRent: data.rent_amount }),
    ...(data.status && { status: data.status.toLowerCase() }),
  }) as unknown as LeaseRecord
  return mapLease(l)
}

export async function deleteLease(id: string): Promise<void> {
  await pb.collection('leases').delete(id)
}

// =====================
// Rent / Payments
// =====================

export interface Payment {
  id: string
  amount: number
  date: string
  method: string
  status: string
  due_date: string
  unit_id: string
  lease_id: string | null
  created_at: string
}

export interface RentSummary {
  expected: number
  collected: number
  pending: number
  overdue: number
  partial: number
}

export interface MonthRentResponse {
  payments: Payment[]
  summary: RentSummary
}

export async function getMonthRent(month: number, year: number): Promise<MonthRentResponse> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  const records = await getPaymentsRaw()
  const filtered = records.filter((p) => p.date >= startDate && p.date <= endDate)

  const payments: Payment[] = filtered.map((p) => ({
    id: p.id,
    amount: p.amount || 0,
    date: p.date,
    method: p.paymentMethod || '',
    status: getStatusMap(p.status || 'pending'),
    due_date: p.dueDate,
    unit_id: p.unit || '',
    lease_id: p.lease || null,
    created_at: p.createdAt,
  }))

  const expected = payments.reduce((s, p) => s + p.amount, 0)
  const collected = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)
  const overdue = payments.filter((p) => p.status === 'OVERDUE').reduce((s, p) => s + p.amount, 0)

  return {
    payments,
    summary: {
      expected,
      collected,
      pending,
      overdue,
      partial: 0,
    },
  }
}

export interface GenerateRentData {
  month: number
  year: number
}

export async function generateRent(data: GenerateRentData): Promise<Payment[]> {
  // Get all active leases
  const allLeases = await getLeasesRaw()
  const leases = allLeases.filter((l) => l.status === 'active')

  const payments: Payment[] = []

  for (const lease of leases) {
    const lr = lease as LeaseRecord
    const targetDate = `${data.year}-${String(data.month).padStart(2, '0')}-01`
    const dueDate = `${data.year}-${String(data.month).padStart(2, '0')}-05`

    // Create payment record
    const p = await pb.collection('payments').create({
      unit: lr.unit,
      tenant: lr.tenant,
      lease: lr.id,
      amount: lr.monthlyRent || 0,
      date: targetDate,
      dueDate,
      type: 'rent',
      status: 'pending',
      paymentMethod: '',
      notes: '',
    }) as unknown as PaymentRecord
    payments.push({
      id: p.id,
      amount: p.amount || 0,
      date: p.date,
      method: p.paymentMethod || '',
      status: 'PENDING',
      due_date: p.dueDate,
      unit_id: p.unit || '',
      lease_id: p.lease || null,
      created_at: p.createdAt,
    })
  }

  return payments
}

export interface MarkPaidData {
  amount: number
  method: string
  date: string
}

export async function markPaid(unitId: string, data: MarkPaidData): Promise<Payment> {
  // Find the pending payment for this unit
  const startDate = `${data.date}-01`
  const records = await pb.collection('payments').getFullList({
    filter: `unit="${unitId}" && status == 'pending'`,
  })

  if (records.length === 0) {
    throw new Error('No pending payment found for this unit')
  }

  const p = await pb.collection('payments').update(records[0].id, {
    status: 'paid',
    paymentMethod: data.method || 'cash',
  }) as unknown as PaymentRecord

  return {
    id: p.id,
    amount: p.amount || 0,
    date: p.date,
    method: p.paymentMethod || '',
    status: 'PAID',
    due_date: p.dueDate,
    unit_id: p.unit || '',
    lease_id: p.lease || null,
    created_at: p.createdAt,
  }
}

// =====================
// Expenses
// =====================

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  receipt_url: string | null
  unit_id: string | null
  created_at: string
}

export async function getExpenses(filters?: {
  category?: string
  unit_id?: string
  month?: number
  year?: number
}): Promise<Expense[]> {
  const records = await pb.collection('expenses').getFullList() as unknown as ExpenseRecord[]

  let expenses: Expense[] = records.map((e) => ({
    id: e.id,
    amount: e.amount || 0,
    category: e.category || 'Other',
    description: e.description || '',
    date: e.date,
    receipt_url: null,
    unit_id: e.unit || null,
    created_at: e.createdAt,
  }))

  // Client-side filtering
  if (filters) {
    if (filters.category) {
      expenses = expenses.filter((e) => e.category === filters.category)
    }
    if (filters.unit_id) {
      expenses = expenses.filter((e) => e.unit_id === filters.unit_id)
    }
    if (filters.month && filters.year) {
      const monthStart = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
      const monthEnd = `${filters.year}-${String(filters.month).padStart(2, '0')}-31`
      expenses = expenses.filter(
        (e) => e.date >= monthStart && e.date <= monthEnd
      )
    }
  }

  return expenses
}

export async function getExpense(id: string): Promise<Expense> {
  const records = await getExpensesRaw()
  const e = records.find((r) => r.id === id)
  if (!e) throw new Error('Expense not found')
  return mapExpense(e)
}

function mapExpense(e: ExpenseRecord): Expense {
  return {
    id: e.id,
    amount: e.amount || 0,
    category: e.category || 'Other',
    description: e.description || '',
    date: e.date,
    receipt_url: null,
    unit_id: e.unit || null,
    created_at: e.createdAt,
  }
}

export interface CreateExpenseData {
  amount: number
  category: string
  description: string
  date: string
  receipt_url?: string
  unit_id?: string
}

export async function createExpense(data: CreateExpenseData, file?: File): Promise<Expense> {
  const payload: Record<string, unknown> = {
    category: data.category,
    amount: data.amount,
    description: data.description,
    date: data.date,
    unit: data.unit_id || '',
    status: 'pending',
  }
  if (file) {
    payload['file'] = file
  }
  const e = await pb.collection('expenses').create(payload) as unknown as ExpenseRecord
  return mapExpense(e)
}

export interface UpdateExpenseData {
  amount?: number
  category?: string
  description?: string
  date?: string
  receipt_url?: string
  unit_id?: string
}

export async function updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
  const e = await pb.collection('expenses').update(id, {
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.category && { category: data.category }),
    ...(data.description && { description: data.description }),
    ...(data.date && { date: data.date }),
    ...(data.unit_id !== undefined && { unit: data.unit_id }),
  }) as unknown as ExpenseRecord
  return mapExpense(e)
}

export async function deleteExpense(id: string): Promise<void> {
  await pb.collection('expenses').delete(id)
}

// =====================
// Maintenance
// =====================

export interface MaintenanceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: string
  cost: number | null
  unit_id: string
  created_at: string
}

export async function getMaintenance(filters?: {
  status?: string
  priority?: string
  unit_id?: string
}): Promise<MaintenanceRequest[]> {
  const records = await pb.collection('maintenance').getFullList() as unknown as MaintenanceRecord[]

  let requests: MaintenanceRequest[] = records.map((m) => ({
    id: m.id,
    title: m.title || '',
    description: m.description || '',
    priority: m.priority || 'medium',
    status: getStatusMap(m.status || 'open'),
    cost: null,
    unit_id: m.unit || '',
    created_at: m.createdAt,
  }))

  // Client-side filtering
  if (filters) {
    if (filters.status) {
      requests = requests.filter((r) => r.status === filters.status)
    }
    if (filters.priority) {
      requests = requests.filter((r) => r.priority === filters.priority)
    }
    if (filters.unit_id) {
      requests = requests.filter((r) => r.unit_id === filters.unit_id)
    }
  }

  return requests
}

export async function getMaintenanceRequest(id: string): Promise<MaintenanceRequest> {
  const records = await getMaintenanceRaw()
  const m = records.find((r) => r.id === id)
  if (!m) throw new Error('Maintenance request not found')
  return mapMaintenance(m)
}

function mapMaintenance(m: MaintenanceRecord): MaintenanceRequest {
  return {
    id: m.id,
    title: m.title || '',
    description: m.description || '',
    priority: m.priority || 'medium',
    status: getStatusMap(m.status || 'open'),
    cost: m.cost ?? null,
    unit_id: m.unit || '',
    created_at: m.createdAt,
  }
}

export interface CreateMaintenanceData {
  title: string
  description: string
  priority?: string
  unit_id: string
  cost?: number
}

export async function createMaintenance(data: CreateMaintenanceData): Promise<MaintenanceRequest> {
  const m = await pb.collection('maintenance').create({
    title: data.title,
    description: data.description || '',
    priority: data.priority || 'medium',
    unit: data.unit_id,
    status: 'open',
  }) as unknown as MaintenanceRecord
  return mapMaintenance(m)
}

export interface UpdateMaintenanceData {
  title?: string
  description?: string
  priority?: string
  status?: string
  cost?: number
}

export async function updateMaintenance(id: string, data: UpdateMaintenanceData): Promise<MaintenanceRequest> {
  const m = await pb.collection('maintenance').update(id, {
    ...(data.title && { title: data.title }),
    ...(data.description && { description: data.description }),
    ...(data.priority && { priority: data.priority }),
    ...(data.status && { status: data.status.toLowerCase() }),
    ...(data.cost !== undefined && { cost: data.cost }),
  }) as unknown as MaintenanceRecord
  return mapMaintenance(m)
}

export async function deleteMaintenance(id: string): Promise<void> {
  await pb.collection('maintenance').delete(id)
}

// =====================
// Dashboard
// =====================

export interface UnitCounts {
  total: number
  occupied: number
  vacant: number
  maintenance: number
  under_renovation: number
}

export interface MonthlyRevenue {
  expected: number
  collected: number
}

export interface ExpenseBreakdown {
  total: number
  net_profit: number
  by_category: Record<string, number>
}

export interface Activity {
  id: string
  type: string
  description: string
  date: string
}

export interface ExpiringLease {
  id: string
  unit_number: string
  tenant_name: string
  end_date: string
  days_until_expiry: number
}

export interface Dashboard {
  unit_counts: UnitCounts
  occupancy_rate: number
  monthly_revenue: MonthlyRevenue
  expenses: ExpenseBreakdown
  recent_activities: Activity[]
  upcoming_expirations: ExpiringLease[]
}

export async function getDashboard(): Promise<Dashboard> {
  // Fetch all data from PocketBase
  const units = await getUnitsRaw()
  const payments = await getPaymentsRaw()
  const expenses = await getExpensesRaw()
  const leases = await getLeasesRaw()

  // Compute unit counts
  const unit_counts: UnitCounts = {
    total: units.length,
    occupied: units.filter((u) => u.status === 'occupied').length,
    vacant: units.filter((u) => u.status === 'vacant').length,
    maintenance: units.filter((u) => u.status === 'maintenance').length,
    under_renovation: units.filter((u) => u.status === 'under_renovation').length,
  }

  // Occupancy rate
  const occupancy_rate = unit_counts.total > 0
    ? (unit_counts.occupied / unit_counts.total) * 100
    : 0

  // Monthly revenue (current month)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  const monthlyPayments = payments.filter(
    (p) => p.date >= startDate && p.date <= endDate
  )
  const collected = monthlyPayments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + (p.amount || 0), 0)

  const expected = leases.reduce((s, l) => s + (l.monthlyRent || 0), 0)

  const monthly_revenue: MonthlyRevenue = {
    expected,
    collected,
  }

  // Expenses by category
  const expenses_total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const by_category: Record<string, number> = {}
  for (const e of expenses) {
    const cat = e.category || 'Other'
    by_category[cat] = (by_category[cat] || 0) + (e.amount || 0)
  }

  const expenses_breakdown: ExpenseBreakdown = {
    total: expenses_total,
    net_profit: collected - expenses_total,
    by_category,
  }

  // Recent activities (placeholder)
  const recent_activities: Activity[] = []

  // Upcoming expirations (within 60 days)
  const expirations: ExpiringLease[] = []
  for (const l of leases) {
    const endDateObj = new Date(l.endDate)
    const daysUntil = Math.floor((endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil >= 0 && daysUntil <= 60) {
      expirations.push({
        id: l.id,
        unit_number: '',
        tenant_name: '',
        end_date: l.endDate,
        days_until_expiry: daysUntil,
      })
    }
  }

  return {
    unit_counts,
    occupancy_rate: Math.round(occupancy_rate * 10) / 10,
    monthly_revenue,
    expenses: expenses_breakdown,
    recent_activities,
    upcoming_expirations: expirations,
  }
}
