import client from './client'

export const getOffers = (params) => client.get('/api/admin/offers', { params })
export const getOfferById = (id) => client.get(`/api/admin/offers/${id}`)
export const createOffer = (data) => client.post('/api/admin/offers', data)
export const updateOffer = (id, data) => client.put(`/api/admin/offers/${id}`, data)
export const deleteOffer = (id) => client.delete(`/api/admin/offers/${id}`)
export const addOfferToBooklet = (booklet_id, offer_id) =>
  client.post('/api/admin/offers/booklet/add', { booklet_id, offer_id })
export const removeOfferFromBooklet = (booklet_id, offer_id) =>
  client.delete(`/api/admin/offers/booklet/${booklet_id}/offer/${offer_id}`)
