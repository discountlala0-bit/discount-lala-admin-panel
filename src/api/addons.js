import client from './client'

export const getAddOns = () => client.get('/api/admin/add-ons')
export const getAddOnById = (id) => client.get(`/api/admin/add-ons/${id}`)
export const createAddOn = (data) => client.post('/api/admin/add-ons', data)
export const updateAddOn = (id, data) => client.put(`/api/admin/add-ons/${id}`, data)
export const deleteAddOn = (id) => client.delete(`/api/admin/add-ons/${id}`)
export const addOfferToAddOn = (add_on_id, offer_id) =>
  client.post('/api/admin/add-ons/add-offer', { add_on_id, offer_id })
export const removeOfferFromAddOn = (add_on_id, offer_id) =>
  client.delete(`/api/admin/add-ons/${add_on_id}/offer/${offer_id}`)
