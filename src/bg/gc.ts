import Browser from 'webextension-polyfill'
import {
  summarizeCredentials,
  summarizeCredentialValue,
} from '@/utilities/debug'
import { isAWSCredentials } from '@/utilities/snippets'

const CREDENTIALS_STORAGE_KEY = 'credentials'
export const DEFAULT_GC_INTERVAL = 30_000
const LOG_PREFIX = '[AWS SAML to STS][gc]'

export const removeExpiredCredentials = async (): Promise<void> => {
  const stored = await Browser.storage.local.get(CREDENTIALS_STORAGE_KEY)
  const credentials = stored[CREDENTIALS_STORAGE_KEY]
  const summary = summarizeCredentialValue(credentials)

  if (typeof credentials === 'undefined') {
    console.log(`${LOG_PREFIX} No stored credentials to clean up.`, summary)
    return
  }

  if (!isAWSCredentials(credentials)) {
    console.error(
      `${LOG_PREFIX} Invalid credentials found in local storage.`,
      summary,
    )
    return
  }

  if (Date.now() >= credentials._expiry) {
    console.log(
      `${LOG_PREFIX} Removing expired credentials.`,
      summarizeCredentials(credentials),
    )
    await Browser.storage.local.remove(CREDENTIALS_STORAGE_KEY)
    return
  }

  console.log(
    `${LOG_PREFIX} Stored credentials are still valid.`,
    summarizeCredentials(credentials),
  )
}

export const startCredentialGarbageCollector = (
  ms: number = DEFAULT_GC_INTERVAL,
): (() => void) => {
  console.log(`${LOG_PREFIX} Starting credential garbage collector.`, {
    intervalMs: ms,
  })

  const runCleanup = (): void => {
    void removeExpiredCredentials().catch((error: unknown): void => {
      console.error(`${LOG_PREFIX} Credential cleanup failed.`, error)
    })
  }

  runCleanup()

  const intervalId = setInterval(runCleanup, ms)

  return (): void => {
    clearInterval(intervalId)
    console.log(`${LOG_PREFIX} Stopped credential garbage collector.`)
  }
}
