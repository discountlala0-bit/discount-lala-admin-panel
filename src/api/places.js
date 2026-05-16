import client from './client'

export const getPlaces = (params) => client.get('/api/admin/places', { params })
export const getPlaceById = (id) => client.get(`/api/admin/places/${id}`)
export const createPlace = (data) => client.post('/api/admin/places', data)
export const updatePlace = (id, data) => client.put(`/api/admin/places/${id}`, data)
export const deletePlace = (id) => client.delete(`/api/admin/places/${id}`)
