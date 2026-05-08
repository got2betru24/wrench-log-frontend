import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// For FormData bodies, remove the Content-Type header so the browser can set
// multipart/form-data with the correct boundary automatically. Without this,
// the global application/json default overrides it and the server can't parse
// the multipart body.
client.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

export default client