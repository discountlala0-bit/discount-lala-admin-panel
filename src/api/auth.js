import client from './client'

export const sendOtp = (phone) => client.post('/api/auth/send-otp', { phone })
export const verifyOtp = (sessionInfo, otp) => client.post('/api/auth/verify-otp', { sessionInfo, otp })
export const verifyIdToken = (idToken) => client.post('/api/auth/verify-id-token', { idToken })
export const getMe = () => client.get('/api/users/me')
