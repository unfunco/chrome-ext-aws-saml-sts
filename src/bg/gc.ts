import Browser from 'webextension-polyfill'
import { AWSCredentials } from '@/utilities'

const DEFAULT_GC_INTERVAL = 30_000

export const gc = async (ms?: number): Promise<NodeJS.Timeout> => {
  const stored = (await Browser.storage.local.get('credentials')) as {
    credentials: AWSCredentials
  }

  if (stored.credentials._expiry < Date.now()) {
    await Browser.storage.local.remove('credentials')
  }

  return setTimeout(gc, ms ?? DEFAULT_GC_INTERVAL)
}
