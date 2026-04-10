import axios from 'axios'
import { env } from '../config/env'

const BASE_URL = env.PAYPAL_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export class PaypalService {

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const { data } = await axios.post(
      `${BASE_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return data.access_token
  }

  async sendPayout(
    paypalEmail: string,
    amount: number,
    currency: string,
    note: string,
    senderItemId: string
  ) {
    const token = await this.getAccessToken()

    // Convert KES to USD approximately (in production use live exchange rate)
    const usdAmount = (amount / 130).toFixed(2)

    const payload = {
      sender_batch_header: {
        sender_batch_id: `yoyzie_${senderItemId}_${Date.now()}`,
        email_subject: 'You have a payment from Yoyzie AI',
        email_message: note,
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: usdAmount,
            currency: 'USD',
          },
          note,
          sender_item_id: senderItemId,
          receiver: paypalEmail,
        },
      ],
    }

    const { data } = await axios.post(
      `${BASE_URL}/v1/payments/payouts`,
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
