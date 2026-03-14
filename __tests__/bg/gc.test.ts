import Browser from 'webextension-polyfill'
import {
  removeExpiredCredentials,
  startCredentialGarbageCollector,
} from '@/bg/gc'

const flushMicrotasks = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('background credential cleanup', (): void => {
  const mockGet = Browser.storage.local.get as jest.MockedFunction<
    typeof Browser.storage.local.get
  >
  const mockRemove = Browser.storage.local.remove as jest.MockedFunction<
    typeof Browser.storage.local.remove
  >

  beforeEach((): void => {
    jest.useFakeTimers()
    jest.spyOn(console, 'error').mockImplementation((): void => undefined)
    jest.spyOn(console, 'log').mockImplementation((): void => undefined)
    mockGet.mockResolvedValue({})
    mockRemove.mockResolvedValue(undefined)
  })

  afterEach((): void => {
    jest.runOnlyPendingTimers()
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('removes expired credentials from local storage', async (): Promise<void> => {
    mockGet.mockResolvedValue({
      credentials: {
        AWS_ACCESS_KEY_ID: '<access_key_id>',
        AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
        AWS_SESSION_TOKEN: '<session_token>',
        _expiry: Date.now() - 1000,
      },
    })

    await removeExpiredCredentials()

    expect(mockRemove).toHaveBeenCalledWith('credentials')
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Removing expired credentials.'),
      expect.objectContaining({
        hasSecretAccessKey: true,
        hasSessionToken: true,
      }),
    )
  })

  it('leaves valid credentials in local storage', async (): Promise<void> => {
    mockGet.mockResolvedValue({
      credentials: {
        AWS_ACCESS_KEY_ID: '<access_key_id>',
        AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
        AWS_SESSION_TOKEN: '<session_token>',
        _expiry: Date.now() + 60_000,
      },
    })

    await removeExpiredCredentials()

    expect(mockRemove).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Stored credentials are still valid.'),
      expect.objectContaining({
        hasSecretAccessKey: true,
        hasSessionToken: true,
      }),
    )
  })

  it('logs invalid stored credentials instead of crashing', async (): Promise<void> => {
    mockGet.mockResolvedValue({
      credentials: 'invalid-credentials',
    })

    await removeExpiredCredentials()

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid credentials found in local storage.'),
      expect.objectContaining({
        present: true,
        valid: false,
        valueType: 'string',
      }),
    )
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it('runs cleanup immediately and on the configured interval', async (): Promise<void> => {
    const stop = startCredentialGarbageCollector(1000)

    await flushMicrotasks()
    expect(mockGet).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000)
    await flushMicrotasks()
    expect(mockGet).toHaveBeenCalledTimes(2)

    stop()
    jest.advanceTimersByTime(1000)
    await flushMicrotasks()
    expect(mockGet).toHaveBeenCalledTimes(2)
  })
})
