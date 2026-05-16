import client from './client'

export const getBooklets = () => client.get('/api/admin/booklets')
export const getBookletById = (id) => client.get(`/api/admin/booklets/${id}`)
export const createBooklet = (data) => client.post('/api/admin/booklets', data)
export const updateBooklet = (id, data) => client.put(`/api/admin/booklets/${id}`, data)
export const deleteBooklet = (id) => client.delete(`/api/admin/booklets/${id}`)
