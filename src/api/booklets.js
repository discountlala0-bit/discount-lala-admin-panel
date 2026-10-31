import client from './client'

export const getBooklets = () => client.get('/api/admin/booklets')
export const getBookletById = (id) => client.get(`/api/admin/booklets/${id}`)
export const getBookletPlaces = (id) => client.get(`/api/admin/booklets/${id}/places`)
export const updateBookletPlacesSequence = (id, data) => client.put(`/api/admin/booklets/${id}/places`, data)
export const createBooklet = (data) => client.post('/api/admin/booklets', data)
export const updateBooklet = (id, data) => client.put(`/api/admin/booklets/${id}`, data)
export const deleteBooklet = (id) => client.delete(`/api/admin/booklets/${id}`)
