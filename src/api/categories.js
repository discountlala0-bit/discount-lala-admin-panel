import client from './client'

export const getCategories = () => client.get('/api/admin/categories')
export const getCategoryById = (id) => client.get(`/api/admin/categories/${id}`)
export const createCategory = (data) => client.post('/api/admin/categories', data)
export const updateCategory = (id, data) => client.put(`/api/admin/categories/${id}`, data)
export const deleteCategory = (id) => client.delete(`/api/admin/categories/${id}`)
