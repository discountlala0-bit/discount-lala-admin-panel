import client from './client'

export const getCities = (params) => client.get('/api/admin/cities', { params })
export const getCityById = (id) => client.get(`/api/admin/cities/${id}`)
export const createCity = (data) => client.post('/api/admin/cities', data)
export const updateCity = (id, data) => client.put(`/api/admin/cities/${id}`, data)
export const deleteCity = (id) => client.delete(`/api/admin/cities/${id}`)
