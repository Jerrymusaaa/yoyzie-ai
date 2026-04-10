import axios from 'axios'
import { env } from '../config/env'

const BASE_URL = env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

export class MpesaBillingService {

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`
    ).toString('base64')

    const { data } = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } }
    )

    return data.access_token
  }

  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountRef: string,
    description: string
  ) {
    const token = await this.getAccessToken()

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14)

    const password = Buffer.from(
      `${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    const formattedPhone = phoneNumber.startsWith('0')
      ? `254${phoneNumber.slice(1)}`
      : phoneNumber.startsWith('+')
      ? phoneNumber.slice(1)
      : phoneNumber

    const payload = {
      BusinessShortCode: env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: env.MPESA_STK_CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: description,
    }

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return data
  }
}
