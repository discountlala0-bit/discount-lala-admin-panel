import client from './client'

export const getAllUsers = (params) => client.get('/api/admin/users', { params })
export const getDeactivatedUsers = () => client.get('/api/admin/users/deactivated')
export const getUserDetails = (id) => client.get(`/api/admin/users/${id}`)
export const reactivateUser = (id) => client.put(`/api/admin/users/${id}/reactivate`)
export const toggleUserStatus = (id) => client.put(`/api/admin/users/${id}/toggle-status`)
