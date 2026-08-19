import client from './client'

export const getDistributors = () => client.get('/api/admin/distributors')
export const getDistributorById = (id) => client.get(`/api/admin/distributors/${id}`)
export const createDistributor = (data) => client.post('/api/admin/distributors', data)
export const updateDistributor = (id, data) => client.put(`/api/admin/distributors/${id}`, data)
export const getRedemptions = (params) => client.get('/api/admin/distributors/redemptions', { params })
