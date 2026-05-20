import client from './client'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return client.post('/api/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
