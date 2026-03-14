import Browser from 'webextension-polyfill'
import { type AWSCredentials } from '@/utilities'
import { saveCredentials } from '@/utilities/storage'

describe('Utilities', (): void => {
  const mockSet = Browser.storage.local.set as jest.MockedFunction<
    typeof Browser.storage.local.set
  >
  const credentials: AWSCredentials = {
    AWS_ACCESS_KEY_ID: '<access_key_id>',
    AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
    AWS_SESSION_TOKEN: '<session_token>',
    _expiry: Date.parse('2026-03-14T14:00:00.000Z'),
  }

  beforeEach((): void => {
    jest.spyOn(console, 'log').mockImplementation((): void => undefined)
    mockSet.mockResolvedValue(undefined)
  })

  afterEach((): void => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('storage', (): void => {
    it('can save new credentials', async (): Promise<void> => {
      await saveCredentials(credentials)

      expect(mockSet).toHaveBeenCalledWith({ credentials })
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Credentials saved to local storage.'),
        expect.objectContaining({
          hasSecretAccessKey: true,
          hasSessionToken: true,
        }),
      )
    })

    it('propagates storage errors', async (): Promise<void> => {
      const error = new Error('Failed to persist credentials')
      mockSet.mockRejectedValue(error)

      await expect(saveCredentials(credentials)).rejects.toThrow(error)
    })
  })
})
