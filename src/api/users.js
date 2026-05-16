import client from './client'

export const getDeactivatedUsers = () => client.get('/api/admin/users/deactivated')
export const reactivateUser = (id) => client.put(`/api/admin/users/${id}/reactivate`)
