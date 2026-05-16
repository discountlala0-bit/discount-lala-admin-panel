import client from './client'

export const getBanners = () => client.get('/api/admin/banners')
export const getBannerById = (id) => client.get(`/api/admin/banners/${id}`)
export const createBanner = (data) => client.post('/api/admin/banners', data)
export const updateBanner = (id, data) => client.put(`/api/admin/banners/${id}`, data)
export const deleteBanner = (id) => client.delete(`/api/admin/banners/${id}`)
