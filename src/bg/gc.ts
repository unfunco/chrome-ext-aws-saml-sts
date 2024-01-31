import Browser from 'webextension-polyfill'
import { AWSCredentials } from '@/utilities'

const DEFAULT_GC_INTERVAL = 30_000

export const gc = async (ms?: number): Promise<NodeJS.Timeout> => {
  const credentials = (await Browser.storage.local.get(
    'credentials',
  )) as AWSCredentials

  if (credentials.__expires_at < Date.now()) {
    await Browser.storage.local.remove('credentials')
  }

  return setTimeout(gc, ms ?? DEFAULT_GC_INTERVAL)
}
