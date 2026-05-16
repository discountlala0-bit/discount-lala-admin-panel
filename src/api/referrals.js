import client from './client'

export const getAllReferrals = () => client.get('/api/referrals/admin/all')
