import axios from 'axios'
import Cookies from 'js-cookie'

const createClient = (baseURL: string) => {
  const client = axios.create({ baseURL, withCredentials: true })

  client.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        Cookies.remove('accessToken')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const authApi = createClient(process.env.NEXT_PUBLIC_AUTH_URL || '')
export const userApi = createClient(process.env.NEXT_PUBLIC_USER_URL || '')
export const contentApi = createClient(process.env.NEXT_PUBLIC_CONTENT_URL || '')
export const schedulingApi = createClient(process.env.NEXT_PUBLIC_SCHEDULING_URL || '')
export const analyticsApi = createClient(process.env.NEXT_PUBLIC_ANALYTICS_URL || '')
export const campaignApi = createClient(process.env.NEXT_PUBLIC_CAMPAIGN_URL || '')
export const walletApi = createClient(process.env.NEXT_PUBLIC_WALLET_URL || '')
export const billingApi = createClient(process.env.NEXT_PUBLIC_BILLING_URL || '')
export const notificationApi = createClient(process.env.NEXT_PUBLIC_NOTIFICATION_URL || '')
export const trendApi = createClient(process.env.NEXT_PUBLIC_TREND_URL || '')
export const aiApi = createClient(process.env.NEXT_PUBLIC_AI_URL || '')
export const socialApi = createClient(process.env.NEXT_PUBLIC_SOCIAL_URL || '')
