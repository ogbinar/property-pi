export interface UserOut {
  id: string
  name: string | null
  email: string
  role: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface UnitOut {
  id: string
  unit_number: string
  type: string
  status: string
  rent_amount: number
  security_deposit: number
  created_at: string
}

export interface TenantOut {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  emergency_contact: string | null
  unit_id: string | null
  created_at: string
}

export interface LeaseOut {
  id: string
  tenant_id: string
  unit_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit_amount: number
  status: string
  created_at: string
}

export interface LeaseOutWithRelations extends LeaseOut {
  tenant: { id: string; first_name: string; last_name: string; email: string } | null
  unit: { id: string; unit_number: string; type: string } | null
}

export interface PaymentOut {
  id: string
  unit_id: string
  lease_id: string | null
  amount: number
  date: string
  payment_method: string
  status: string
  due_date: string
  created_at: string
}

export interface ExpenseOut {
  id: string
  unit_id: string | null
  amount: number
  category: string
  description: string
  date: string
  receipt_url: string | null
  created_at: string
}

export interface MaintenanceRequestOut {
  id: string
  unit_id: string
  tenant_id: string | null
  title: string
  description: string
  priority: string
  status: string
  cost: number | null
  created_at: string
}

export interface DashboardData {
  unit_counts: {
    total: number
    occupied: number
    vacant: number
    maintenance: number
    under_renovation: number
  }
  occupancy_rate: number
  monthly_revenue: {
    expected: number
    collected: number
  }
  expenses: {
    total: number
    net_profit: number
    by_category: Record<string, number>
  }
  recent_activities: {
    id: string
    type: string
    description: string
    date: string
  }[]
  upcoming_expirations: {
    id: string
    unit_number: string
    tenant_name: string
    end_date: string
    days_until_expiry: number
  }[]
}

export interface RentSummary {
  expected: number
  collected: number
  pending: number
  overdue: number
  partial: number
}

export interface ShareLinkResult {
  token: string
  link: string
}

export interface MaintenanceCreatePortal {
  title: string
  description: string
  priority?: string
}

export interface NoticeOut {
  id: string
  title: string
  message: string
  type: string
  status: string
  unit_id: string | null
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface TenantPortalLease {
  id: string
  unit_id: string
  tenant_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit_amount: number
  status: string
  tenant: { id: string; first_name: string; last_name: string; email: string } | null
  unit: { id: string; unit_number: string; type: string } | null
}
