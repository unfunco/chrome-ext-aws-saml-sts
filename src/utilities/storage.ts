import { type AWSCredentials } from '@/utilities/snippets'
import Browser from 'webextension-polyfill'

export const saveCredentials = async (
  credentials: AWSCredentials,
): Promise<void> => {
  Browser.storage.local.set({ credentials }).then(
    (): void => console.log('Saved credentials'),
    (error: unknown): void =>
      console.error('Failed to save credentials', error),
  )
}
