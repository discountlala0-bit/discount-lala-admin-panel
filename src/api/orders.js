import client from './client'

export const getOrders = (params) => client.get('/api/admin/orders', { params })
export const updateOrderStatus = (id, status) => client.put(`/api/admin/orders/${id}/status`, { status })
