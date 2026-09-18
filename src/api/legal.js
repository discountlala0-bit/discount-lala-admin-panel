import client from './client'

export const getTermsAndConditions = () => client.get('/api/admin/legal/terms-and-conditions')
export const updateTermsAndConditions = (content) =>
  client.put('/api/admin/legal/terms-and-conditions', { content })

export const getPrivacyPolicy = () => client.get('/api/admin/legal/privacy-policy')
export const updatePrivacyPolicy = (content) =>
  client.put('/api/admin/legal/privacy-policy', { content })
