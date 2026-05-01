import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Units from './pages/Units.jsx'
import UnitsNew from './pages/UnitsNew.jsx'
import UnitDetail from './pages/UnitDetail.jsx'
import UnitEdit from './pages/UnitEdit.jsx'
import Tenants from './pages/Tenants.jsx'
import TenantsNew from './pages/TenantsNew.jsx'
import TenantDetail from './pages/TenantDetail.jsx'
import TenantEdit from './pages/TenantEdit.jsx'
import Leases from './pages/Leases.jsx'
import LeasesNew from './pages/LeasesNew.jsx'
import LeaseDetail from './pages/LeaseDetail.jsx'
import Expenses from './pages/Expenses.jsx'
import ExpensesNew from './pages/ExpensesNew.jsx'
import ExpenseEdit from './pages/ExpenseEdit.jsx'
import Maintenance from './pages/Maintenance.jsx'
import MaintenanceNew from './pages/MaintenanceNew.jsx'
import MaintenanceDetail from './pages/MaintenanceDetail.jsx'
import RentCollection from './pages/RentCollection.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="text-gray-500">Loading...</div></div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="text-gray-500">Loading...</div></div>
  }
  if (user) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="units" element={<Units />} />
        <Route path="units/new" element={<UnitsNew />} />
        <Route path="units/:id" element={<UnitDetail />} />
        <Route path="units/:id/edit" element={<UnitEdit />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenants/new" element={<TenantsNew />} />
        <Route path="tenants/:id" element={<TenantDetail />} />
        <Route path="tenants/:id/edit" element={<TenantEdit />} />
        <Route path="leases" element={<Leases />} />
        <Route path="leases/new" element={<LeasesNew />} />
        <Route path="leases/:id" element={<LeaseDetail />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="expenses/new" element={<ExpensesNew />} />
        <Route path="expenses/:id" element={<ExpenseEdit />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="maintenance/new" element={<MaintenanceNew />} />
        <Route path="maintenance/:id" element={<MaintenanceDetail />} />
        <Route path="rent" element={<RentCollection />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
