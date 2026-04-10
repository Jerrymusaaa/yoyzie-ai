import CryptoJS from 'crypto-js'
import { env } from '../config/env'

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, env.TOKEN_ENCRYPTION_KEY).toString()
}

export const decrypt = (cipherText: string): string => {
  const bytes = CryptoJS.AES.decrypt(cipherText, env.TOKEN_ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
