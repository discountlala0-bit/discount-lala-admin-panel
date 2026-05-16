import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'

import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Cities from '@/pages/Cities'
import Categories from '@/pages/Categories'
import Places from '@/pages/Places'
import Offers from '@/pages/Offers'
import Booklets from '@/pages/Booklets'
import AddOns from '@/pages/AddOns'
import Banners from '@/pages/Banners'
import Orders from '@/pages/Orders'
import Users from '@/pages/Users'
import Distributors from '@/pages/Distributors'
import Commissions from '@/pages/Commissions'
import Coupons from '@/pages/Coupons'
import Referrals from '@/pages/Referrals'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="cities" element={<Cities />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="places" element={<Places />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="booklets" element={<Booklets />} />
                  <Route path="add-ons" element={<AddOns />} />
                  <Route path="banners" element={<Banners />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="users" element={<Users />} />
                  <Route path="distributors" element={<Distributors />} />
                  <Route path="commissions" element={<Commissions />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="referrals" element={<Referrals />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
