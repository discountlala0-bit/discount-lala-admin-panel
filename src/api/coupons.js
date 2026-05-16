import client from './client'

export const getAllCoupons = () => client.get('/api/coupons/admin/all')
export const createCoupon = (data) => client.post('/api/coupons/admin/create', data)
export const updateCoupon = (id, data) => client.put(`/api/coupons/admin/${id}`, data)
