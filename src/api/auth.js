import client from './client'

export const adminLogin = (email, password) => client.post('/api/admin/auth/login', { email, password })
export const getMe = () => client.get('/api/users/me')
