import { type AWSCredentials } from '@/utilities/snippets'
import { summarizeCredentials } from '@/utilities/debug'
import Browser from 'webextension-polyfill'

const LOG_PREFIX = '[AWS SAML to STS][storage]'

export const saveCredentials = async (
  credentials: AWSCredentials,
): Promise<void> => {
  console.log(
    `${LOG_PREFIX} Saving credentials to local storage.`,
    summarizeCredentials(credentials),
  )
  await Browser.storage.local.set({ credentials })
  console.log(
    `${LOG_PREFIX} Credentials saved to local storage.`,
    summarizeCredentials(credentials),
  )
}
