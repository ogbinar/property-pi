export interface UserRecord {
  id: string
  email: string
  emailVisibility: boolean
  emailVerified: boolean
  tokenKey: string
  confirm: string
  invalidate: string
  passthru: boolean
  name: string
  role: 'landlord' | 'tenant'
  createdAt: string
  updatedAt: string
}

export interface UnitRecord {
  id: string
  name: string
  number: string
  floor: number
  area: number
  type?: string
  rent: number
  deposit: number
  status: 'vacant' | 'occupied' | 'maintenance' | 'under_renovation'
  features: string
  description: string
  rentHistory: Record<string, unknown>[]
  createdAt: string
  updatedAt: string
}

export interface TenantRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  unit: string
  moveInDate: string
  moveOutDate: string | null
  status: 'active' | 'inactive' | 'eviction'
  notes: string
  contactLog: Record<string, unknown>[]
  createdAt: string
  updatedAt: string
}

export interface LeaseRecord {
  id: string
  unit: string
  tenant: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
  status: 'active' | 'expired' | 'pending' | 'terminated'
  tenantAccess: string
  createdAt: string
  updatedAt: string
}

export interface PaymentRecord {
  id: string
  unit: string
  tenant: string
  lease: string
  amount: number
  date: string
  dueDate: string
  type: 'rent' | 'deposit' | 'fee' | 'other'
  status: 'pending' | 'paid' | 'overdue' | 'refunded'
  paymentMethod: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseRecord {
  id: string
  category: string
  amount: number
  date: string
  description: string
  unit: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  file: string | null
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRecord {
  id: string
  unit: string
  tenant: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  cost?: number
  createdAt: string
  updatedAt: string
}

export interface NoticeRecord {
  id: string
  unit: string
  tenant: string
  title: string
  message: string
  type: 'general' | 'rent' | 'maintenance' | 'notice_to_occupier' | 'lease'
  status: 'draft' | 'sent' | 'delivered'
  createdAt: string
  updatedAt: string
}
